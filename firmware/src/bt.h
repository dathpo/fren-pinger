#ifndef BT_H_
#define BT_H_

void bt_init(double (*on_subscribe)(void));

void bt_notify(double temp);

#endif