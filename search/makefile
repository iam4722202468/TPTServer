CC = g++
CFLAGS = -std=c++11 -I"./includes" -I"./jsoncpp/json"

search : main.o jsoncpp.o range.o
	${CC} ${CFLAGS} main.o jsoncpp.o -o search
	
jsoncpp.o : ./jsoncpp/jsoncpp.cpp ./jsoncpp/json/json.h ./jsoncpp/json/json-forwards.h
	${CC} ${CFLAGS} -c ./jsoncpp/jsoncpp.cpp

main.o : ./src/main.cpp ./includes/main.h
	${CC} ${CFLAGS} -c ./src/main.cpp

range.o : ./range/range.cpp ./includes/range/v3/all.hpp
	${CC} ${CFLAGS} -c ./range/range.cpp

clean:
	rm *.o
