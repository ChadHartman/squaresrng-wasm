/**************************************************************************\
*                                                                          *
*   Create keys.h include file                                             *
*                                                                          *
*   This program generates keys that may be used with the squares RNG.     *
*   1937295360 (about 2 billion) keys may be generated. The user specifies *
*   a subset of these that will be placed in the keys.h file.  A starting  *
*   point in the 2 billion and the number to be generated will be entered. *
*   The user may enter return for the default (1 for starting point and    *
*   number of 25000).                                                      *
*                                                                          *
*   The keys are created so that the upper 8 digits are different and also *
*   that the lower 8 digits are different.  The lower 8 digits are created *
*   systematically so that all possible combinations are produced.  The    *
*   ninth digit is chosen to be different than the eighth digit.  The rest *
*   of the upper 7 digits are chosen randomly.  For any two keys produced, *
*   it is certain that at least one digit is different in the lower 9      *
*   digits.  Testing has shown that this prevents similarities that can    *
*   arise in streams produced by keys that vary only in the upper digits.  *
*                                                                          *
*   The keys.h file may be used as follows:                                *
*                                                                          *
*                                                                          *
*   uint64_t keys[] = {                                                    *
*   #include "keys.h"                                                      *
*   };                                                                     *
*                                                                          *
*   rand = squares(ctr,keys[i]);                                           *
*                                                                          *
*                                                                          *
*   Note:  For most usages only one key is necessary (even for the largest *
*   super-computers).  A single key will provide 2^64 numbers.  For a      *
*   computer with 10 million cores, using the 2^64 numbers one can provide *
*   streams of length of about 1.8 trillion for each core.  This is likely *
*   to be adequate for most usages.  For this reason, it is suggested to   *
*   take a key from keys.h and use a #define as shown below.  This would   *
*   be faster than using a memory reference for the key.                   *
*                                                                          *
*                                                                          *
*   #define k 0xc58efd154ce32f6d                                           *
*                                                                          *
*   rand = squares(ctr,k);                                                 *
*                                                                          *
*                                                                          *
*   See the streams directory for example usage.                           *
*                                                                          *
\**************************************************************************/

#include <stdio.h>
#include <stdlib.h>

#define n8dig 138378240
#define prime 111111113

/* local copy of msws rng */

uint64_t xi = 0, wi = 0, si = 0xb5ad4eceda1ce2a9;

inline static uint32_t mswsi() {

   xi *= xi; xi += (wi += si); return xi = (xi>>32) | (xi<<32);

}

int main() {

 uint64_t a, b, c, d, e, f, g, h, i, j, k, m, n, p, q, r, s, x;

 uint64_t t[16][14];

 uint32_t *y, beg, end;

 char u;

 FILE *fp;

/* malloc area for 8 lower digits */

 y = (uint32_t *) malloc(n8dig*4);
 if (y == NULL) {
  printf("malloc error\n");
  return 1;
 }

 printf("\nCreate keys.h include file \n\n");
 printf(
 "This program generates keys that may be used with the squares RNG.\n");
 printf(
 "1937295360 (about 2 billion) keys may be generated. The user specifies\n");
 printf(
 "a subset of these that will be placed in the keys.h file.  A starting\n");
 printf(
 "point in the 2 billion and the number to be generated will be entered.\n");
 printf(
 "The user may enter return for the default (1 for starting point and\n");
 printf(
 "number of 25000).\n\n");

 i = 0;
 while (i == 0) {
 printf("enter starting point (return for default 1) ");
  u = getchar();
  if (u == '\n') {
    beg = 1;
  } else {
    ungetc(u, stdin);
    scanf("%d",&beg);
    u = getchar();
  }
  if (beg>=0 && beg < 1937295360) i=1;
 }
 while(i == 1) {
  printf("enter number of keys (return for default 25000) ");
  u = getchar();
  if (u == '\n') {
     end = beg + 24999;
  } else {
     ungetc(u, stdin);
     scanf("%d",&end);
     u = getchar();
     end = beg + end - 1;
  }
  if(end>=0 && end <=1937295359) i=2;
 }

 printf("\ngenerating keys from %d to %d\n",beg,end);

 /* open keys.h file */

 fp = fopen("keys.h","w");
 if (fp == NULL) {
   printf("unable to open keys.h file\n");
   return 1;
 }
 n = 0;

 /* produce all possible different 8 lower digits */
 
 for(a=1;a<16;a+=2){
  for(b=1;b<16;b++){
   for(c=1;c<16;c++){
    for(d=1;d<16;d++){
     for(e=1;e<16;e++){
      for(f=1;f<16;f++){
       for(g=1;g<16;g++){
        for(h=1;h<16;h++){
         if(      g!=h){
          if(     f!=h && f!=g){
           if(    e!=h && e!=g && e!=f){
            if(   d!=h && d!=g && d!=f && d!=e){
             if(  c!=h && c!=g && c!=f && c!=e && c!=d){
              if( b!=h && b!=g && b!=f && b!=e && b!=d && b!=c){
               if(a!=h && a!=g && a!=f && a!=e && a!=d && a!=c && a!=b){
                y[n++] = a |
                   (b<< 4) | 
                   (c<< 8) |
                   (d<<12) |
                   (e<<16) |
                   (f<<20) |
                   (g<<24) |
                   (h<<28) ;
               }
              }
             }
            }
           }
          }
         }
        }
       }
      }
     }
    }
   }
  }
 }

 /* create array of different digits for 9th digit */

 for (i=1;i<16;i++) {
  for (j=0,k=i;j<14;j++) {
   if (++k > 15) k -= 15;
   t[i][j] = k;
  }
 }
 
 /* generate digits */

 for (m=0,n=0;m<14;m++) {
  for (i=0;i<n8dig;i++) {

   /* get lower 8 digits */
                             
   x = y[ (i*prime) % n8dig ];  /* prime "randomizes" data */
                                /* if x = y[i] was used, consecutive */
                                /* values would have a similar appearance */
                                /* due to the systematic way the lower */
                                /* 8 digits are generated */

   /* get 9th digit different than 8th digit */

   j = x>>28;
   x |= t[j][m]<<32;

   /* fill in rest of digits randomly */

   for (p=60,q=(1<<j);p>32;) {
    k = mswsi();                      /* get 8 digit 32-bit random word */
    for (r=0;r<32;r+=4) {
     s = (k>>r) & 0xf;                /* get a digit */
     if (s!=0 && (q & (1<<s)) == 0) { /* not 0 and not previous */
       q |= (1<<s);
       x |= (s<<p);                   /* add digit to output */
       p -= 4;
       if (p==32) break;
     }
    }
   }

   if (n>=beg && n<=end) {
     fprintf (fp,"0x%16.16lx,\n",x); 
   }
   if(++n > end) {
     fclose(fp);
     printf("\nkeys.h created\n");
     return 0;
   }
  }
 }

 return 0;

}
