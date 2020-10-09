/**************************************************************************\
*                                                                          *
*  Four round counter-based middle square                                  *
*                                                                          *
*  squares(ctr,key) - returns a 32-bit unsigned int [0,0xffffffff]         *
*                                                                          *
*  The parameters are patterned after Philox parameters. The first is      *
*  the counter.  This is an arbitrary 64-bit unsigned integer.  The        *
*  second is the key.  The key should be an entry from the keys.h file.    *
*  The keys.h file contains keys that have been created with different     *
*  hexadecimal digits. This assures sufficient change in the ctr*key       *
*  computation.                                                            *
*                                                                          *
*  This generator would be used in a similar way as Philox.  One would     *
*  increment a counter and then call the RNG to generate a random number.  *
*                                                                          *
*  Four rounds of squaring are performed and the result is returned.       *
*  For the first three rounds, the result is rotated right 32 bits.        *
*  This places the random data in the best position for the next round.    *
*  y = ctr*key or z = (ctr+1)*key is added on each round.  For keys        *
*  generated by the key utility, either ctr*key or (ctr+1)*key will        *
*  have non-zero digits.  This improves randomization and also provides    *
*  for a uniform output.                                                   *
*                                                                          *
*  Note:  The squares RNG was based on ideas derived from Middle Square    *
*  Weyl Sequence RNG.  One of the ideas was to obtain uniformity by adding *
*  the Weyl sequence after squaring.  Richard P. Brent (creator of the     *
*  xorgens RNG) suggested this method.  It turns out that adding ctr*key   *
*  is equivalent.  Brent's idea provides the basis for uniformity in this  *
*  generator.                                                              *
*                                                                          *
*  Copyright (c) 2020 Bernard Widynski                                     *
*                                                                          *
*  This code can be used under the terms of the GNU General Public License *
*  as published by the Free Software Foundation, either version 3 of the   *
*  License, or any later version. See the GPL license at URL               *
*  http://www.gnu.org/licenses                                             *
*                                                                          *
\**************************************************************************/

#include <stdint.h>

inline static uint32_t squares(uint64_t ctr, uint64_t key) {

   uint64_t x, y, z;

   y = x = ctr * key; z = y + key;
   
   x = x*x + y; x = (x>>32) | (x<<32);       /* round 1 */

   x = x*x + z; x = (x>>32) | (x<<32);       /* round 2 */

   x = x*x + y; x = (x>>32) | (x<<32);       /* round 3 */

   return (x*x + z) >> 32;                   /* round 4 */

}
