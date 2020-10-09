/**************************************************************************\
*                                                                          *
*   squares time test (four rounds)                                        *
*                                                                          *
\**************************************************************************/

#include <stdio.h>
#include <stdint.h>

#define two32 4294967296.

#define billion 1000000000

#define k 0x548c9decbce65297

#include "squares4.h"  /* four rounds */

int main()
{
    uint64_t i,n = billion;

    double sum = 0;

    for (i=0; i<n; i++) {
       sum += (squares(i,k) / two32);
    } 

    printf ("average = %lf\n",sum/n);

    return 0;
}
