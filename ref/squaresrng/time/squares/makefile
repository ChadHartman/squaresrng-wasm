squares : squares.c
	#
	# Compiling squares timetest
	#
	gcc -O3 -Wall -I../.. squares.c -o squares

run : squares
	#
	# Running squares timetest
	#
	nice --adjustment=-20 time ./squares

clean :
	rm -f *.exe
