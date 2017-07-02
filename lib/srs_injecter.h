

#ifndef SRS_INJECTER_HPP
#define SRS_INJECTER_HPP
#ifdef _WIN32
    // include windows first.
    #include <windows.h>
    // the type used by this header for windows.
    typedef unsigned long long u_int64_t;
    typedef u_int64_t uint64_t;
    typedef long long int64_t;
    typedef unsigned int u_int32_t;
    typedef u_int32_t uint32_t;
    typedef int int32_t;
    typedef unsigned char u_int8_t;
    typedef u_int8_t uint8_t;
    typedef char int8_t;
    typedef unsigned short u_int16_t;
    typedef u_int16_t uint16_t;
    typedef short int16_t;
    typedef int64_t ssize_t;
    struct iovec {
        void  *iov_base;    /* Starting address */
        size_t iov_len;     /* Number of bytes to transfer */
    };

    // for pid.
    typedef int pid_t;
    pid_t getpid(void);
#endif

#include <stdint.h>
#include <sys/types.h>

#ifdef __cplusplus
extern "C"{
#endif

extern int srs_injecter();

#ifdef __cplusplus
}
#endif

#endif

