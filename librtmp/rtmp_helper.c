
#include "rtmp_helper.h"

uint8_t *build_metadata(int *p_size) 
{
	char buf[4096];
	char *enc = buf;
	char *end = enc+sizeof(buf);

	// Encode Data body
	enc_str(&enc, end, "onMetaData");

	*enc++ = AMF_ECMA_ARRAY;
	enc    = AMF_EncodeInt32(enc, end, 14);

	enc_num_val(&enc, end, "duration", 0.0);
	enc_num_val(&enc, end, "fileSize", 0.0);

	enc_num_val(&enc, end, "width", 640);
	enc_num_val(&enc, end, "height", 480);

	enc_str_val(&enc, end, "videocodecid", "avc1");
	enc_num_val(&enc, end, "videodatarate", 0);
	enc_num_val(&enc, end, "framerate", 0);

	enc_str_val(&enc, end, "audiocodecid", "mp4a");
	enc_num_val(&enc, end, "audiodatarate", 0);
	enc_num_val(&enc, end, "audiosamplerate", (double)44100);
	enc_num_val(&enc, end, "audiosamplesize", 16.0);
	enc_num_val(&enc, end, "audiochannels", (double)0);

	enc_bool_val(&enc, end, "stereo", 0);

// 	dstr_printf(&encoder_name, "%s (libobs version ",
// 			MODULE_NAME);

// #ifdef HAVE_OBSCONFIG_H
// 	dstr_cat(&encoder_name, OBS_VERSION);
// #else
// 	dstr_catf(&encoder_name, "%d.%d.%d",
// 			LIBOBS_API_MAJOR_VER,
// 			LIBOBS_API_MINOR_VER,
// 			LIBOBS_API_PATCH_VER);
// #endif

// 	dstr_cat(&encoder_name, ")");

// 	enc_str_val(&enc, end, "encoder", encoder_name.array);
// 	dstr_free(&encoder_name);

	*enc++  = 0;
	*enc++  = 0;
	*enc++  = AMF_OBJECT_END;

	uint32_t meta_data_size  = enc-buf;
	uint8_t *meta_data_body = malloc(sizeof(uint8_t) * meta_data_size);
	memcpy(meta_data_body, buf, meta_data_size);

	// start building metadata package
	char p_buf[4096];
	int p_end = 0;

	w_int8(p_buf, &p_end, RTMP_PACKET_TYPE_INFO); // write package info
	w_int24(p_buf, &p_end, meta_data_size); // write metadata size
	w_int32(p_buf, &p_end, 0); // write timestamp
	w_int24(p_buf, &p_end, 0); // write stream_id
	w_buf(p_buf, meta_data_body, &p_end, meta_data_size); // write metadata content
	w_int32(p_buf, &p_end, 0); // write previous tag size

	free(meta_data_body);

	uint8_t *package = malloc(sizeof(uint8_t) * p_end);
	memcpy(package, p_buf, p_end);
	*p_size = p_end;
	return package;
}

 AVal *flv_str(AVal *out, const char *str)
{
	out->av_val = (char*)str;
	out->av_len = (int)strlen(str);
	return out;
}

 void enc_num_val(char **enc, char *end, const char *name,
		double val)
{
	AVal s;
	*enc = AMF_EncodeNamedNumber(*enc, end, flv_str(&s, name), val);
}

 void enc_bool_val(char **enc, char *end, const char *name,
		bool val)
{
	AVal s;
	*enc = AMF_EncodeNamedBoolean(*enc, end, flv_str(&s, name), val);
}

 void enc_str_val(char **enc, char *end, const char *name,
		const char *val)
{
	AVal s1, s2;
	*enc = AMF_EncodeNamedString(*enc, end,
			flv_str(&s1, name),
			flv_str(&s2, val));
}

 void enc_str(char **enc, char *end, const char *str)
{
	AVal s;
	*enc = AMF_EncodeString(*enc, end, flv_str(&s, str));
}

// Utilities
void w_int8(char* buf, int *end, int n)
{
	buf[*end] = n & 0xFF;
	*end += 1;
}

void w_int16(char *buf, int *end, int n)
{
	buf[*end] = (n >> 8) & 0xFF;
	buf[*end + 1] = n & 0xFF;
	*end += 2;
}

void w_int24(char *buf, int *end, int n)
{
	buf[*end] = (n >> 16) & 0xFF;
	buf[*end + 1] = (n >> 8) & 0xFF;
	buf[*end + 2] = n & 0xFF;
	*end += 3;
}

void w_int32(char *buf, int *end, int n)
{
	buf[*end] = (n >> 24) & 0xFF;
	buf[*end + 1] = (n >> 16) & 0xFF;
	buf[*end + 2] = (n >> 8) & 0xFF;
	buf[*end + 3] = n & 0xFF;
	*end += 4;
}

void w_buf(void *des, void* src, int *end, int size)
{
	memcpy(des, src + *end, size);
	*end += size;
}