/**************************************************************************\
*                                                                          *
*  streams1 - streams by counters with same key                            *
*                                                                          *
*  In the program below, we compute an average of a billion numbers from   *
*  5 separate streams of a trillion in length.                             *
*                                                                          *
*  Note:  A single key can produce 2^64 random numbers.  For most usages,  *
*  this is sufficient data.  However, if more than a total of 2^64 numbers *
*  are needed, then one would use multiple keys. (see streams2)            *
*                                                                          *
\**************************************************************************/

#include <stdio.h>

#include "squares.h"

#define two32 4294967296.

#define billion 1000000000

#define trillion 1000000000000

#define k 0xc58efd154ce32f6d

int main (void) {

   uint64_t i, j, n = billion;

   uint64_t str, end;

   double sum;

   /* compute average for five streams */ 

   printf("\nMethod 1:  streams by counters with same key\n\n");

   for (j=0;j<5;j++) {

       sum = 0;

       str = j * trillion;  /* starting counter for stream */

       end = str + billion; /* ending counter for billion numbers */

       for (i=str;i<end;i++) {

          sum += (squares(i,k) / two32);

       }

       printf("stream %3ld average = %lf\n",j,sum/n);

   }

   return 0;

}
