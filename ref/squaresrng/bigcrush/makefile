bigcrush : bigcrush.c
	#
	# Compiling BigCrush test program
	#
	gcc -O3 -Wall -I../ bigcrush.c -o bigcrush -ltestu01 -lprobdist -lmylib -lm 

run : bigcrush
	#
	# Starting BigCrush test in background
	#
	nice ./bigcrush > bigcrush.out &
	#
	# See bigcrush.out for results
	#
	# Note:  This may take several hours to complete
	#

clean :
	rm -f *.exe bigcrush.out
