/**************************************************************************\
*                                                                          *
*  streams2 - streams by keys with same counters                           *
*                                                                          *
*  In the program below, we compute an average of a billion numbers from   *
*  5 separate streams using keys from keys.h                               *
*                                                                          *
\**************************************************************************/

#include <stdio.h>

#include "squares.h"

#define two32 4294967296.

#define billion 1000000000

uint64_t keys[] = {
#include "keys.h"
};

int main (void) {

   uint64_t i, j, k, n = billion;

   double sum;

   /* compute average for five streams using keys.h */ 

   printf("\nMethod 2:  streams by keys with same counters\n\n");

   for (j=0;j<5;j++) {

       k = keys[j]; 

       sum = 0;
 
       /* use counters from 0 to billion for each stream */

       for (i=0;i<n;i++) {

          sum += (squares(i,k) / two32);

       }

       printf("stream %3ld average = %lf\n",j,sum/n);

   }
   return 0;

}
