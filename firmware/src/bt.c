#include <zephyr/bluetooth/gatt.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>

#include "bt.h"

LOG_MODULE_REGISTER(bt, LOG_LEVEL_INF);

/** @brief UUID of the Button Service. */
#define BT_UUID_BUTTON_SERVICE_RAW                                                                 \
	BT_UUID_128_ENCODE(0xa4de0201, 0xa156, 0x493c, 0x83d8, 0x845c40da5203)

/** @brief UUID of the Button TX Characteristic. */
#define BT_UUID_BUTTON_TX_RAW BT_UUID_128_ENCODE(0xa4de0202, 0xa156, 0x493c, 0x83d8, 0x845c40da5203)

#define BT_UUID_BUTTON_SERVICE BT_UUID_DECLARE_128(BT_UUID_BUTTON_SERVICE_RAW)
#define BT_UUID_BUTTON_TX_CHAR BT_UUID_DECLARE_128(BT_UUID_BUTTON_TX_RAW)

enum bt_send_status {
	BT_SEND_ENABLED,
	BT_SEND_DISABLED,
};

static void on_tx_char_ccc_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value);
void notify_cb(struct k_work *work);

static float latest_temp_reading;

K_WORK_DEFINE(notify_work, notify_cb);
K_MUTEX_DEFINE(temp_mutex);

BT_GATT_SERVICE_DEFINE(auth_svc, BT_GATT_PRIMARY_SERVICE(BT_UUID_BUTTON_SERVICE),
					   BT_GATT_CHARACTERISTIC(BT_UUID_BUTTON_TX_CHAR, // uuid
											  BT_GATT_CHRC_NOTIFY, // props
											  BT_GATT_PERM_READ, // permissions
											  NULL, // read attribute cb
											  NULL, // write attribute cb
											  NULL), // user data
					   BT_GATT_CCC(on_tx_char_ccc_cfg_changed,
								   BT_GATT_PERM_READ | BT_GATT_PERM_WRITE));

static void on_tx_char_sent(struct bt_conn *conn, void *user_data)
{
	ARG_UNUSED(user_data);

	char addr[BT_ADDR_LE_STR_LEN];
	bt_addr_le_to_str(bt_conn_get_dst(conn), addr, ARRAY_SIZE(addr));
	LOG_INF("Data sent over TX characteristic to %s", addr);
}

static int tx_char_send(struct bt_conn *conn, const uint8_t *data, uint16_t len)
{
	LOG_DBG("Sending data over TX characteristic");
	struct bt_gatt_notify_params params = { 0 };
	/* TODO (DTP): limit the search by restricting range */
	const struct bt_gatt_attr *attr = bt_gatt_find_by_uuid(NULL, 0, BT_UUID_BUTTON_TX_CHAR);

	params.attr = attr;
	params.data = data;
	params.len = len;
	params.func = on_tx_char_sent;

	if (!conn) {
		LOG_DBG("Notification send to all connected peers");
		return bt_gatt_notify_cb(NULL, &params);
	} else if (bt_gatt_is_subscribed(conn, attr, BT_GATT_CCC_NOTIFY)) {
		return bt_gatt_notify_cb(conn, &params);
	} else {
		return -EINVAL;
	}
}

static void on_tx_char_ccc_cfg_changed(const struct bt_gatt_attr *attr, uint16_t value)
{
	enum bt_send_status status = (value == BT_GATT_CCC_NOTIFY) ? BT_SEND_ENABLED : BT_SEND_DISABLED;

	switch (status) {
	case BT_SEND_ENABLED:
		LOG_INF("Notifications enabled");
		break;
	case BT_SEND_DISABLED:
		LOG_INF("Notifications disabled");
		break;
	default:
		LOG_ERR("Unknown value");
		return;
	}
}

void notify_cb(struct k_work *work)
{
	uint8_t data[sizeof(float)];

	k_mutex_lock(&temp_mutex, K_FOREVER);
	memcpy(data, &latest_temp_reading, sizeof(latest_temp_reading));
	k_mutex_unlock(&temp_mutex);

	(void)tx_char_send(NULL, data, sizeof(data));
}

void notify(float temp)
{
	k_mutex_lock(&temp_mutex, K_FOREVER);
	latest_temp_reading = temp;
	k_mutex_unlock(&temp_mutex);

	int err = k_work_submit(&notify_work);
	if (err < 0) {
		LOG_ERR("Failed to submit work to generate the challenge, error %d", err);
	}
}
