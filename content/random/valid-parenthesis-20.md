
+++
title = "Valid Parenthesis: Solution"
date = 2026-10-08
description = "Gotta start with DSA one day or another, so here I am."

[taxonomies]
tags = ["dsa", "solutions", "stack"]

[extra]
difficulty = "easy"
problem = "https://leetcode.com/problems/valid-parentheses/"
+++

## Approach


For this example, I could first define a hashmap, with opening and closing 
brackets for relating them to each other, then check if the char is opening bracket,
if yes, push it to stack, and if we hit a closing bracket, we jst peek the stack..
if stack is empty, or '(' is not value of ')' in hashmap string is invalid, return false.
Can't think of how this won't go wrong

```C++
class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> pairs = {
          {')', '('},
          {'}', '{'},
          {']', '['},
        };

        stack<char> st;
        for(const char& c: s){
            if(!pairs.contains(c)){
                st.push(c);
              }else{
                  if(st.empty() || st.top() != pairs[c]){
                      return false;
                  }
                st.pop();
              }
          }

          return true;
    }
};
```


this looked like it worked, but.. one test failed.
Input was:
'['

Yeah... Dumb mistake lwkey.
The solution would return true even if there are unterminated brackets...
So had to replace true with something dynamic, if the bracket unterminated
That means it still sits on stack, so stack.empty() would return false.

hence replaced the last line with `return st.empty()` It worked!
## Solution

```c++
class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> pairs = {
          {')', '('},
          {'}', '{'},
          {']', '['},
        };

        stack<char> st;
        for(const char& c: s){
            if(!pairs.contains(c)){
                st.push(c);
              }else{
                  if(st.empty() || st.top() != pairs[c]){
                      return false;
                  }
                st.pop();
              }
          }

          return st.empty();
    }
};

```

## Learning

So seems like this pattern of solutions is called LIFO or stack-based matching.
The main reason I could get it was probably because the biggest hint was this should
be closed in the order it opened, basically like the last one to be opened should be
the first one to be closed.. And when you code enough, you build this small logic
system I guess.

Like you wanna define relation between opening and closing bracket? Use HashMap!
You want the last element checked stored to be first one to exit? Use Stack!
And on.. and on...

