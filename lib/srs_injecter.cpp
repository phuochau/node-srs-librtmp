#ifdef __cplusplus
extern "C"{
#endif

#if defined(WIN32) || defined(_WIN32)
#define EXPORT __declspec(dllexport)
#else
#define EXPORT
#endif

#ifndef SRS_HELPER_HPP
#define SRS_HELPER_HPP

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#include "srs_librtmp.h"

#define RE_PULSE_MS 300
#define RE_PULSE_JITTER_MS 3000

extern int srs_injecter();

#ifdef __cplusplus
}
#endif
/*
The MIT License (MIT)
Copyright (c) 2013-2015 SRS(ossrs)
Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/**
gcc srs_ingest_flv.c ../../objs/lib/srs_librtmp.a -g -O0 -lstdc++ -o srs_ingest_flv
*/

int proxy(srs_flv_t flv, srs_rtmp_t ortmp);
int connect_oc(srs_rtmp_t ortmp);
int64_t re_create();
void re_update(int64_t re, int32_t starttime, u_int32_t time);
void re_cleanup(int64_t re, int32_t starttime, u_int32_t time);

int64_t tools_main_entrance_startup_time;
int srs_injecter()
{
    int ret = 0;
    
    // main function
    tools_main_entrance_startup_time = srs_utils_time_ms();
    
    // user option parse index.
    int opt = 0;
    // user options.
    char* in_flv_file = "test.flv";
    char* out_rtmp_url = "rtmp://192.168.99.100:32776/live/srs";
    // char* out_rtmp_url = "rtmp://127.0.0.1:1935/live/srs";
    // char* out_rtmp_url = "rtmp://rtmp-api.facebook.com:80/rtmp/1381171998632629?ds=1&s_l=1&a=ATjF4E3jCtqHJMfp";
    // rtmp handler
    srs_rtmp_t ortmp;
    // flv handler
    srs_flv_t flv;
    
    srs_human_trace("input:  %s", in_flv_file);
    srs_human_trace("output: %s", out_rtmp_url);

    if ((flv = srs_flv_open_read(in_flv_file)) == NULL) {
        ret = 2;
        srs_human_trace("open flv file failed. ret=%d", ret);
        return ret;
    }
    
    ortmp = srs_rtmp_create(out_rtmp_url);

    ret = proxy(flv, ortmp);
    srs_human_trace("ingest flv to RTMP completed");
    
    srs_rtmp_destroy(ortmp);
    srs_flv_close(flv);
    
    return ret;
}

int do_proxy(srs_flv_t flv, srs_rtmp_t ortmp, int64_t re, int32_t* pstarttime, u_int32_t* ptimestamp)
{
    int ret = 0;
    
    // packet data
    char type;
    int size;
    char* data = NULL;
    
    srs_human_trace("start ingest flv to RTMP stream");
    for (;;) {
        // tag header
        if ((ret = srs_flv_read_tag_header(flv, &type, &size, ptimestamp)) != 0) {
            if (srs_flv_is_eof(ret)) {
                srs_human_trace("parse completed.");
                return 0;
            }
            srs_human_trace("flv get packet failed. ret=%d", ret);
            return ret;
        }
        
        if (size <= 0) {
            srs_human_trace("invalid size=%d", size);
            break;
        }
        
        // TODO: FIXME: mem leak when error.
        data = (char*)malloc(size);
        if ((ret = srs_flv_read_tag_data(flv, data, size)) != 0) {
            return ret;
        }
        
        u_int32_t timestamp = *ptimestamp;
        
        srs_human_trace("Hau Vo: Go here. Package Type: %d", type);
        // if ((ret = srs_human_print_rtmp_packet(type, timestamp, data, size)) != 0) {
        //     srs_human_trace("print packet failed. ret=%d", ret);
        //     return ret;
        // }
        
        if ((ret = srs_rtmp_write_packet(ortmp, type, *ptimestamp, data, size)) != 0) {
            srs_human_trace("irtmp get packet failed. ret=%d", ret);
            return ret;
        }
            
        if (*pstarttime < 0 && srs_utils_flv_tag_is_av(type)) {
            *pstarttime = *ptimestamp;
        }
        
        re_update(re, *pstarttime, *ptimestamp);
        // usleep(10 * 1000);
    }
    
    return ret;
}

int proxy(srs_flv_t flv, srs_rtmp_t ortmp)
{
    int ret = 0;
    u_int32_t timestamp = 0;
    int32_t starttime = -1;
    
    char header[13];
    if ((ret = srs_flv_read_header(flv, header)) != 0) {
        return ret;
    }
    if ((ret = connect_oc(ortmp)) != 0) {
        return ret;
    }
    
    int64_t re = re_create();
    
    ret = do_proxy(flv, ortmp, re, &starttime, &timestamp);
    
    // for the last pulse, always sleep.
    re_cleanup(re, starttime, timestamp);
    
    return ret;
}

int connect_oc(srs_rtmp_t ortmp)
{
    int ret = 0;
    
    if ((ret = srs_rtmp_handshake(ortmp)) != 0) {
        srs_human_trace("ortmp simple handshake failed. ret=%d", ret);
        return ret;
    }
    srs_human_trace("ortmp simple handshake success");
    
    if ((ret = srs_rtmp_connect_app(ortmp)) != 0) {
        srs_human_trace("ortmp connect vhost/app failed. ret=%d", ret);
        return ret;
    }
    srs_human_trace("ortmp connect vhost/app success");
    
    if ((ret = srs_rtmp_publish_stream(ortmp)) != 0) {
        srs_human_trace("ortmp publish stream failed. ret=%d", ret);
        return ret;
    }
    srs_human_trace("ortmp publish stream success");
    
    return ret;
}

int64_t re_create()
{
    // if not very precise, we can directly use this as re.
    int64_t re = srs_utils_time_ms();
    
    // use the starttime to get the deviation
    int64_t deviation = re - tools_main_entrance_startup_time;
    srs_human_trace("deviation is %d ms, pulse is %d ms", (int)(deviation), (int)(RE_PULSE_MS));
    
    // so, we adjust time to max(0, deviation)
    // because the last pulse, we already sleeped
    int adjust = (int)(deviation);
    if (adjust > 0) {
        srs_human_trace("adjust re time for %d ms", adjust);
        re -= adjust;
    } else {
        srs_human_trace("no need to adjust re time");
    }
    
    return re;
}
void re_update(int64_t re, int32_t starttime, u_int32_t time)
{
    // send by pulse algorithm.
    int64_t now = srs_utils_time_ms();
    int64_t diff = time - starttime - (now -re);
    if (diff > RE_PULSE_MS && diff < RE_PULSE_JITTER_MS) {
        usleep((useconds_t)(diff * 1000));
    }
}
void re_cleanup(int64_t re, int32_t starttime, u_int32_t time)
{
    // for the last pulse, always sleep.
    // for the virtual live encoder long time publishing.
    int64_t now = srs_utils_time_ms();
    int64_t diff = time - starttime - (now -re);
    if (diff > 0) {
        srs_human_trace("re_cleanup, diff=%d, start=%d, last=%d ms", 
            (int)diff, starttime, time);
        usleep((useconds_t)(diff * 1000));
    }
}

#endif