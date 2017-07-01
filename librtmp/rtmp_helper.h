
#include <string.h>
#include <stdbool.h>
#include "rtmp.h"

uint8_t *build_metadata(int *p_size);

// encode
AVal *flv_str(AVal *out, const char *str);
void enc_num_val(char **enc, char *end, const char *name, double val);
void enc_bool_val(char **enc, char *end, const char *name, bool val);
void enc_str_val(char **enc, char *end, const char *name, const char *val);
void enc_str(char **enc, char *end, const char *str);

// utilities
void w_int8(char *buf, int *end, int n);
void w_int16(char *buf, int *end, int n);
void w_int24(char *buf, int *end, int n);
void w_int32(char *buf, int *end, int n);
void w_buf(void *des, void* src, int *end, int size);