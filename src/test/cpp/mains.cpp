#include <stdio.h>
#include "../../../ref/squaresrng/squares4.h"
#include <string>

class rng_t
{

private:
    uint64_t ctr;
    uint64_t key;

public:
    rng_t(uint64_t ctr, uint64_t key)
        : ctr(ctr),
          key(key) {}

    uint32_t rand()
    {
        return squares(ctr++, key);
    }
};

// https://www.pcg-random.org/posts/bounded-rands.html
uint32_t bounded_rand(rng_t &rng, uint32_t range)
{
    uint32_t x;
    uint64_t m;
    uint32_t l;
    uint32_t t = (-range) % range;

    do
    {
        x = rng.rand();
        m = uint64_t(x) * uint64_t(range);
        l = uint32_t(m);
    } while (l < t);
    return m >> 32;
}

int main(int argc, char *argv[])
{
    // $a.out ctr key
    if (argc != 4)
    {
        printf("Invalid arguments; usage:\n\t%s <counter> <key> <range>\n", argv[0]);
        return -1;
    }

    uint64_t counter = std::stoull(argv[1]);
    uint64_t key = std::stoull(argv[2]);
    uint32_t range = std::stoul(argv[3]);
    rng_t rng(counter, key);

    printf("%u", bounded_rand(rng, range));

    return 0;
}