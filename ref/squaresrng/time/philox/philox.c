/**************************************************************************\
*                                                                          *
*   philox time test                                                       *
*                                                                          *
*   note: The include directory from Random123-1.13.2 was copied into      *
*   this directory.  This was downloaded from  www.deshawresearch.com      *
*                                                                          *
\**************************************************************************/

#include <stdio.h>
#include <Random123/philox.h>

#define two32 4294967296.

#define billion 1000000000

philox4x32_ctr_t c = {{}};
philox4x32_key_t k = {{}};

int main(void) {

    uint64_t i,n = billion, m = billion/4;

    double sum = 0;

    k.v[0] = 0xdeadbeefU;

    for (i=0; i<m; i++) {

       c.v[0] = i;

       philox4x32_ctr_t r = philox4x32(c, k);

       sum += (r.v[0] / two32);
       sum += (r.v[1] / two32);
       sum += (r.v[2] / two32);
       sum += (r.v[3] / two32);

    } 

    printf ("average = %lf\n",sum/n);

    return 0;

}
