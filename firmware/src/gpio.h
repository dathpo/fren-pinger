#ifndef GPIO_H_
#define GPIO_H_

#include <zephyr/drivers/sensor.h>

void gpio_init(void);

int gpio_green_led_on(void);

int gpio_green_led_off(void);

int gpio_amber_led_on(void);

int gpio_amber_led_off(void);

#endif /* GPIO_H_ */