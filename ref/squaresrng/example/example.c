/**************************************************************************\
*                                                                          *
*   Compute the average of a billion random numbers                        *
*                                                                          *
\**************************************************************************/

#include <stdio.h>

#include "squares.h"

#define two32 4294967296.

#define billion 1000000000

#define k 0x548c9decbce65297

int main () {

   uint64_t i, n = billion;

   double sum = 0;

   for (i=0;i<n;i++) {

       sum += (squares(i,k) / two32);

   }

   printf("\naverage = %lf\n",sum/n);

   return 0;

}
