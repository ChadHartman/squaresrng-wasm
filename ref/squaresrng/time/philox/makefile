philox : philox.c
	#
	# Compiling philox timetest
	#
	gcc -O3 -Wall -I./random123-include philox.c -o philox

run : philox
	#
	# Running philox timetest
	#
	nice --adjustment=-20 time ./philox

clean :
	rm -f *.exe
