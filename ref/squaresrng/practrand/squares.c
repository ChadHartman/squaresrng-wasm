/**************************************************************************\
*                                                                          *
*   Run PractRand test                                                     *
*                                                                          *
\**************************************************************************/

#include <stdio.h>

#include "squares.h"

#define k 0x548c9decbce65297 
   
int main () {

   uint64_t i;
   uint32_t j;

   freopen(NULL,"wb",stdout);

   for (i=1;;i++ ){
      j = squares(i,k);
      fwrite(&j,4,1,stdout);
   }

   return 0;
}

