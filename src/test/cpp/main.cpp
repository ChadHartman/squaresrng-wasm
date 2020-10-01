#include <stdio.h>
#include "../../../ref/squaresrng/squares4.h"
#include <string>

int main(int argc, char *argv[])
{
    // $a.out ctr key
    if (argc != 3)
    {
        printf("Invalid arguments; usage:\n\t%s <counter> <key>\n", argv[0]);
        return -1;
    }

    uint64_t counter = std::stoull(argv[1]);
    uint64_t key = std::stoull(argv[2]);

    printf("%u", squares(counter, key));

    return 0;
}