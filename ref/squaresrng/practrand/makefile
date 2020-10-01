squares: squares.c 
	#
	# Compiling squares
	#
	gcc -O3 -Wall -I../ squares.c -o squares

run : squares
	#
	# Starting PractRand test in background
	# 	
	nice ./squares | nice ./RNG_test stdin32 -tlmax 44 > practrand.out &
	#
	# See practrand.out for results
	#
	# Note:  This test runs through 16 terabytes of data
	#
	# One may use the "ps -a" and "kill" commands to terminate the test
	#

clean :
	rm -f squares.exe practrand.out
