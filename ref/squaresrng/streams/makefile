all : streams1 streams2

streams1 : streams1.c
	#
	# Compiling streams1
	#
	gcc -O3 -Wall -I../ streams1.c -o streams1

streams2 : streams2.c
	#
	# Compiling streams2
	#
	gcc -O3 -Wall -I../ streams2.c -o streams2

run : streams1 streams2
	#
	# Running streams1
	#
	./streams1
	#
	# Running streams2
	#
	./streams2

clean :
	rm -f *.exe
