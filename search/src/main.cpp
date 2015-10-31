#include <iostream>
#include <string>
#include <fstream>
#include <streambuf>

#include <algorithm> 

#include <range/v3/algorithm.hpp>
#include <range/v3/view.hpp>

#include <json.h>

using namespace ranges;

//not written by me
template <std::size_t N>
struct get_n {
  template <typename T>
  auto operator()(T&& t) const ->
    decltype(std::get<N>(std::forward<T>(t))) {
      return std::get<N>(std::forward<T>(t));
  }
};

namespace ranges {
template <class T, class U>
std::ostream& operator << (std::ostream& os, common_pair<T, U> const& p) {
  return os << '(' << p.first << ", " << p.second << ')';
}
}
//not written by me


int compareLevenshtein(std::string searchKey, std::string haystack)
{
	int changes = 0;
	for(int place = 0; place < searchKey.length(); place++)
	{
		if(searchKey[place] != haystack[place])
			changes++;
	}
	return changes;
}

int compareShift(std::string searchKey, std::string haystack, int shifted = 0, int leastChanges = -1) //level 0
{
	std::string shiftedSearch = haystack.substr(shifted,haystack.length() - haystack.length() + searchKey.length());
	int changes;
	
	if(shifted + (int)searchKey.length() - (int)haystack.length() <= 0)
	{
		changes = compareLevenshtein(searchKey, shiftedSearch);
		
		if(leastChanges == -1 || (leastChanges > 0 && changes < leastChanges))
			leastChanges = changes;
		
		leastChanges = compareShift(searchKey, haystack, shifted+1, leastChanges);
	}
	return leastChanges;
}

//searches to see if the characters in the needle exist in the haystack
//ex. moo vs nm99o00o would around 50%, all chars are found but spread out
//    moo vs 00o00 would return <10%, only one char is found
int compareOverlay(std::string searchKey, std::string haystack) //level 1
{
	double score = 0;
	int searchCharPlace = 0;
	int passNumber = 0;
	
	while(searchKey.length() > passNumber)
	{
		for(int place = 0; place < haystack.length(); place++)
		{
			if(searchKey.length() > searchCharPlace && haystack[place] == searchKey[searchCharPlace+passNumber])
			{
				score += 1/(passNumber+1);
				searchCharPlace++;
			} else if(searchKey.length() < searchCharPlace)
				break;
		}
		passNumber++;
	}
	
	if(score > 0)
		score = ((double)score / (double)haystack.length())*100;
	
	return score;
}

void splitString(std::vector<std::string>* splitPlace, std::string splitKey, char splitChar)
{
	std::string currentString = "";
	for(int x = 0; x < splitKey.length(); x++)
	{
		if(splitKey[x] == splitChar)
		{
			splitPlace->push_back(currentString);
			currentString = "";
		} else {
			currentString += splitChar;
		}
	}
}

int main(int argc, char* argv[])
{
	std::string fileName;
	int returnAmount = -1;
	
	fileName = argv[1];
	returnAmount = atoi(argv[2]);
	
	std::ifstream t(fileName);
	std::string JSONData((std::istreambuf_iterator<char>(t)), std::istreambuf_iterator<char>());
	
	std::string searchKey = "";
	
	for(int x = 3; x < argc; x++)
		if(x > 3)
			searchKey += " " + std::string(argv[x]);
		else
			searchKey += std::string(argv[x]);
	
	Json::Value root;
	Json::Reader reader;
	bool parsedSuccess = reader.parse(JSONData, root, false);
	
	std::vector<int> compareOverlayValues;
	std::vector<int> TotalValues;
	std::vector<int> placeVector;
	
	double score = 0;
	
	for(int place = 0; place < root["Saves"].size(); place++)
	{
		score = compareShift(searchKey, root["Saves"][place]["Name"].asString());
		
		if(score == 1 || score == 0)
		{
			compareOverlayValues.push_back(compareOverlay(searchKey, root["Saves"][place]["Name"].asString()));
			
			TotalValues.push_back((double)compareOverlayValues.at(compareOverlayValues.size()-1)/(score+1));
			placeVector.push_back(place);
			
			score = 0;
		}
	}
	
	if(TotalValues.size() > 0 && returnAmount < placeVector.size())
	{
		auto zipped = view::zip(placeVector, TotalValues);
		sort(zipped, less{}, get_n<1>{});
		
		for(int place = 0; place <= returnAmount; place++)
			std::cout << root["Saves"][placeVector.at(placeVector.size()-1-place)]["Name"].asString() << std::endl << TotalValues.at(placeVector.size()-1-place) << std::endl;
	}
	else if(returnAmount >= placeVector.size())
	{
		auto zipped = view::zip(placeVector, TotalValues);
		sort(zipped, less{}, get_n<1>{});
		
		for(int place = 0; place < placeVector.size(); place++)
			std::cout << root["Saves"][placeVector.at(placeVector.size()-1-place)]["Name"].asString() << std::endl << TotalValues.at(placeVector.size()-1-place) << std::endl;
	}
	
	return 0;
}
