/**************************************************************************\
*                                                                          *
*   Run BigCrush test                                                      *
*                                                                          *
\**************************************************************************/

#include <stdio.h>
#include "unif01.h"
#include "bbattery.h"

#include "squares.h"

#define k 0x548c9decbce65297 

uint64_t c = 0;

uint32_t mysquares() {

  return squares(c++,k);

}
 
int main (void) {

   unif01_Gen *gen;

   gen = unif01_CreateExternGenBits ("squares", mysquares);

   bbattery_BigCrush (gen);

   unif01_DeleteExternGenBits (gen);

   return 0;

}
