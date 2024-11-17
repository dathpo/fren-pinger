
#include "temp.h"

#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(temp, LOG_LEVEL_INF);

static const struct device *temp_dev = DEVICE_DT_GET_ANY(nordic_nrf_temp);

void temp_init(void)
{
	if (temp_dev == NULL || !device_is_ready(temp_dev)) {
		LOG_WRN("no temperature device");
	} else {
		LOG_INF("temp device is %p, name is %s", temp_dev, temp_dev->name);
	}
}

double temp_get(void)
{
	struct sensor_value temp_value;

	int err = sensor_sample_fetch(temp_dev);
	if (err) {
		LOG_INF("sensor_sample_fetch failed return: %d", err);
	}

	err = sensor_channel_get(temp_dev, SENSOR_CHAN_DIE_TEMP, &temp_value);
	if (err) {
		LOG_INF("sensor_channel_get failed return: %d", err);
	}

	double temp = sensor_value_to_double(&temp_value);
	LOG_INF("temperature is %gC", temp);

	return temp;
}