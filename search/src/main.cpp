#include <iostream>
#include <string>

#include "json.h"

std::string JSONData = "{\"Saves\":[{\"Date\":1444514789,\"DateCreated\":1444514789,\"Description\":\"\",\"ID\":3,\"Name\":\"three\",\"Published\":true,\"Score\":-1,\"ScoreDown\":1,\"ScoreUp\":0,\"ShortName\":\"three\",\"Username\":\"iam\",\"Version\":0,\"Views\":55,\"_id\":\"56198be5e715c24073947471\"},{\"Date\":1444514768,\"DateCreated\":1444514768,\"Description\":\"first save\",\"ID\":1,\"Name\":\"one\",\"Published\":true,\"Score\":1,\"ScoreDown\":0,\"ScoreUp\":1,\"ShortName\":\"one\",\"Username\":\"iam\",\"Version\":0,\"Views\":109,\"_id\":\"56198bd0e715c2407394746f\"},{\"Date\":1444514877,\"DateCreated\":1444514877,\"Description\":\"\",\"ID\":5,\"Name\":\"five\",\"Published\":true,\"Score\":1,\"ScoreDown\":0,\"ScoreUp\":1,\"ShortName\":\"five\",\"Username\":\"iam\",\"Version\":0,\"Views\":116,\"_id\":\"56198c3de715c24073947473\"},{\"Date\":1444515001,\"DateCreated\":1444515001,\"Description\":\"\",\"ID\":6,\"Name\":\"six\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"six\",\"Username\":\"iam\",\"Version\":0,\"Views\":52,\"_id\":\"56198cb934062be0766d1c94\"},{\"Date\":1444576330,\"DateCreated\":1444576330,\"Description\":\"\",\"ID\":7,\"Name\":\"seven\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"seven\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7c4ad0ec4dee1bfd4bc2\"},{\"Date\":1444576382,\"DateCreated\":1444576382,\"Description\":\"\",\"ID\":12,\"Name\":\"twelve\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"twelve\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7c7ed0ec4dee1bfd4bc7\"},{\"Date\":1444576491,\"DateCreated\":1444576491,\"Description\":\"\",\"ID\":20,\"Name\":\"twenty\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"twenty\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7cebd0ec4dee1bfd4bcf\"},{\"Date\":1444576511,\"DateCreated\":1444576511,\"Description\":\"\",\"ID\":21,\"Name\":\"twenty one\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"twenty one\",\"Username\":\"iam\",\"Version\":0,\"Views\":52,\"_id\":\"561a7cffd0ec4dee1bfd4bd0\"},{\"Date\":1444576395,\"DateCreated\":1444576395,\"Description\":\"\",\"ID\":13,\"Name\":\"thirteen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"thirteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7c8bd0ec4dee1bfd4bc8\"},{\"Date\":1444576405,\"DateCreated\":1444576405,\"Description\":\"\",\"ID\":14,\"Name\":\"fourteen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"fourteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":51,\"_id\":\"561a7c95d0ec4dee1bfd4bc9\"},{\"Date\":1444576413,\"DateCreated\":1444576413,\"Description\":\"\",\"ID\":15,\"Name\":\"fifteen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"fifteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":51,\"_id\":\"561a7c9dd0ec4dee1bfd4bca\"},{\"Date\":1444576425,\"DateCreated\":1444576425,\"Description\":\"\",\"ID\":16,\"Name\":\"sixteen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"sixteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7ca9d0ec4dee1bfd4bcb\"},{\"Date\":1444576434,\"DateCreated\":1444576434,\"Description\":\"\",\"ID\":17,\"Name\":\"seventeen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"seventeen\",\"Username\":\"iam\",\"Version\":0,\"Views\":51,\"_id\":\"561a7cb2d0ec4dee1bfd4bcc\"},{\"Date\":1444576447,\"DateCreated\":1444576447,\"Description\":\"\",\"ID\":18,\"Name\":\"eighteen\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"eighteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":50,\"_id\":\"561a7cbfd0ec4dee1bfd4bcd\"},{\"Date\":1444576457,\"DateCreated\":1444576457,\"Description\":\"\",\"ID\":19,\"Name\":\"nineteen\",\"Published\":true,\"Score\":1,\"ScoreDown\":0,\"ScoreUp\":1,\"ShortName\":\"nineteen\",\"Username\":\"iam\",\"Version\":0,\"Views\":52,\"_id\":\"561a7cc9d0ec4dee1bfd4bce\"},{\"Date\":1444576340,\"DateCreated\":1444576340,\"Description\":\"\",\"ID\":8,\"Name\":\"eight\",\"Published\":true,\"Score\":0,\"ScoreDown\":0,\"ScoreUp\":0,\"ShortName\":\"eight\",\"Updated\":1445191387,\"Username\":\"iam\",\"Version\":1,\"Views\":51,\"_id\":\"561a7c54d0ec4dee1bfd4bc3\"},{\"ID\":22,\"DateCreated\":1445191491,\"Date\":1445191491,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty two\",\"ShortName\":\"twenty two\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df4313571a54504b147d\"},{\"ID\":23,\"DateCreated\":1445191506,\"Date\":1445191506,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty three\",\"ShortName\":\"twenty three\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df5213571a54504b147e\"},{\"ID\":24,\"DateCreated\":1445191514,\"Date\":1445191514,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty four\",\"ShortName\":\"twenty four\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df5a13571a54504b147f\"},{\"ID\":25,\"DateCreated\":1445191523,\"Date\":1445191523,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty five\",\"ShortName\":\"twenty five\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df6313571a54504b1480\"},{\"ID\":26,\"DateCreated\":1445191529,\"Date\":1445191529,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty siz\",\"ShortName\":\"twenty siz\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df6913571a54504b1481\"},{\"ID\":27,\"DateCreated\":1445191538,\"Date\":1445191538,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty seven\",\"ShortName\":\"twenty seven\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df7213571a54504b1482\"},{\"ID\":28,\"DateCreated\":1445191550,\"Date\":1445191550,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty eight\",\"ShortName\":\"twenty eight\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df7e13571a54504b1483\"},{\"ID\":29,\"DateCreated\":1445191559,\"Date\":1445191559,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"twenty nine\",\"ShortName\":\"twenty nine\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df8713571a54504b1484\"},{\"ID\":30,\"DateCreated\":1445191572,\"Date\":1445191572,\"Version\":0,\"Score\":0,\"ScoreUp\":0,\"ScoreDown\":0,\"Name\":\"thirty\",\"ShortName\":\"thirty\",\"Description\":\"\",\"Published\":true,\"Username\":\"iam\",\"_id\":\"5623df9413571a54504b1485\"}],\"SearchKey\":\"thirtu\"}";

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

int compareShift(std::string searchKey, std::string haystack, int shifted = 0, int leastChanges = -1) //level 1
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
int compareOverlay(std::string searchKey, std::string haystack) //level 2
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

//find combinations of groups of letters
//groups of 1, groups of 2, groups of 2 offset 1, groups of 3, groups of 3 offset 1, etc.
//ex mooasdf
// m,o,o,a,s,d,f
// mo,oa,sd,f
// m, oo, as, df
// moo,asd,f
// m, oo, asd, f
// mo, oas, df

void getGrouping(std::vector<std::string>* keyGroups, std::string searchKey, int offset = 0, int groupSize = 1) //level 3
{
	std::string currentGroup = "";
	
	//split string in to vector
	for(int place = 0; place < searchKey.length(); place++)
	{
		currentGroup += searchKey[place];
		if(place == offset-1)
		{
			keyGroups->push_back(currentGroup);
			currentGroup = "";
		}
		else if(currentGroup.length() >= groupSize)
		{
			keyGroups->push_back(currentGroup);
			currentGroup = "";
		}
		else if(place+groupSize-offset-1 == searchKey.length())
			keyGroups->push_back(currentGroup);
	}
	
	offset++;
	if(offset == groupSize)
	{
		offset = 0;
		groupSize++;
	}
	if(groupSize <= searchKey.length()+1)
		getGrouping(keyGroups, searchKey, offset, groupSize);
	else
		return;
}

int main()
{
	Json::Value root;
	Json::Reader reader;
	bool parsedSuccess = reader.parse(JSONData, root, false);
	
	std::vector<int> compareShiftValues;
	std::vector<int> compareOverlayValues;
	
	std::vector<std::string> keyGroups;
	
	std::string searchKey = root["SearchKey"].asString();
	
	std::cout << "Searching for: " << searchKey << std::endl;

	getGrouping(&keyGroups, searchKey);
	
	for(int place = 0; place < root["Saves"].size(); place++)
	{
		compareShiftValues.push_back(compareShift(searchKey, root["Saves"][place]["Name"].asString()));
		compareOverlayValues.push_back(compareOverlay(searchKey, root["Saves"][place]["Name"].asString()));
	}
	
	for(int x = 0; x < compareOverlayValues.size(); x++)
	{
		std::cout << compareOverlayValues.at(x) << "% similar to " << root["Saves"][x]["Name"].asString() << std::endl;
	}
	
	return 0;
}
