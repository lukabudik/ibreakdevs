export const tasks: string[] = [
  "Write a Python function `add(a, b)` that returns the sum of two numbers. Print the result of `add(15, 27)`.",
  "Write a Python function `multiply(a, b)` that returns the product of two numbers. Print the result of `multiply(12, 11)`.",
  "Write a Python function `is_even(n)` that returns `True` if a number is even, `False` otherwise. Print the result for `is_even(99)`.",
  "Write a Python function `greet(name)` that returns the string 'Hello, [name]!'. Print the result for `greet('Dev')`.",
  "Write a Python function `calculate_rectangle_area(length, width)` that returns the area. Print the area for length 5 and width 8.",
  "Write a Python function `celsius_to_fahrenheit(celsius)` that converts Celsius to Fahrenheit (F = C * 9/5 + 32). Print the result for 25 degrees Celsius.",
  "Write a Python function `simple_interest(principal, rate, time)` that calculates simple interest (I = P*R*T). Print the interest for P=1000, R=0.05, T=2.",
  "Write a Python function `get_first_element(lst)` that returns the first element of a list. Print the result for `[10, 20, 30]`.",
  "Write a Python function `concatenate_strings(s1, s2)` that returns the two strings joined together. Print the result for 'Code' and ' Duel'.",
  "Write a Python function `square(n)` that returns the square of a number. Print the square of 12.",

  "Write a Python function `reverse_string(s)` that returns the reversed version of a string. Print the result for 'hello world'.",
  "Write a Python function `is_palindrome(s)` that returns True if a string is a palindrome (reads the same forwards and backward), False otherwise. Ignore spaces and case. Print the result for 'A man a plan a canal Panama'.",
  "Write a Python function `find_max(numbers)` that returns the maximum number in a list of numbers. Print the result for `[1, 5, 2, 9, 3]`.",
  "Write a Python function `factorial(n)` that returns the factorial of a non-negative integer n (n!). Print the factorial of 5.",
  "Write a Python function `count_vowels(s)` that counts the number of vowels (a, e, i, o, u, case-insensitive) in a string. Print the count for 'Programming is fun'.",
  "Write a Python function `sum_list(numbers)` that returns the sum of all numbers in a list. Print the sum for `[1, 2, 3, 4, 5]`.",
  "Write a Python function `find_average(numbers)` that returns the average of a list of numbers. Print the average for `[10, 20, 30, 40]`.",
  "Write a Python function `remove_duplicates(lst)` that takes a list and returns a new list with duplicates removed, preserving original order. Print the result for `[1, 2, 2, 3, 4, 3, 5]`.",
  "Write a Python function `check_prime(n)` that returns `True` if a number `n` (n > 1) is prime, `False` otherwise. Print the result for `n=29`.",
  "Write a Python function `fibonacci(n)` that returns the nth Fibonacci number (starting with F0=0, F1=1). Print the 10th Fibonacci number (F9).",
  "Write a Python function `merge_sorted_lists(list1, list2)` that merges two sorted lists into a single sorted list. Print the result for `[1, 3, 5]` and `[2, 4, 6]`.",
  "Write a Python function `find_missing_number(nums)` that finds the missing number in an array containing n distinct numbers taken from the range 0 to n. Print the result for `[3, 0, 1]`.",
  "Write a Python function `word_frequency(text)` that returns a dictionary mapping each word to its frequency in the text (case-insensitive, ignore punctuation). Print the result for 'This is a test. This test is simple.'",

  "Write a Python function `is_anagram(s1, s2)` that checks if two strings are anagrams (contain the same characters with the same frequencies, ignore case and spaces). Print the result for 'Listen' and 'Silent'.",
  "Write a Python function `find_common_elements(list1, list2)` that returns a list of elements common to both lists, without duplicates. Print the result for `[1, 2, 3, 4]` and `[3, 4, 5, 6]`.",
  "Write a Python function `binary_search(sorted_list, target)` that implements binary search to find the index of a target in a sorted list, or -1 if not found. Print the index of 7 in `[1, 3, 5, 7, 9, 11]`.",
  "Write a Python function `group_anagrams(strs)` that groups a list of strings by anagrams. Return a list of lists. Print the result for `['eat', 'tea', 'tan', 'ate', 'nat', 'bat']`.",
  "Write a Python function `max_subarray_sum(nums)` that finds the contiguous subarray within a list of numbers (containing at least one number) which has the largest sum. Print the sum for `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`.",
  "Write a Python function `validate_parentheses(s)` that determines if a string containing just '(', ')', '{', '}', '[' and ']' is valid (brackets close in correct order). Print the result for '()[]{}' and '([)]'.",
  "Write a Python function `rotate_matrix(matrix)` that rotates an NxN matrix 90 degrees clockwise in-place (modify the matrix directly, no return needed). Define a 3x3 matrix `[[1,2,3],[4,5,6],[7,8,9]]`, rotate it, and then print the modified matrix.",
  "Write a Python function `lru_cache(capacity)` that implements a Least Recently Used (LRU) cache using a class. It should have `get(key)` and `put(key, value)` methods. Demonstrate its usage by creating a cache with capacity 2, putting (1,1), (2,2), getting (1), putting (3,3), getting (2) (should be -1 or indicate miss), getting (1), getting (3). Print the result of each get operation.",
  "Write a Python function `find_kth_largest(nums, k)` that finds the k-th largest element in an unsorted list. Print the 2nd largest element in `[3, 2, 1, 5, 6, 4]`.",
  "Write a Python function `longest_palindromic_substring(s)` that finds the longest palindromic substring within a given string. Print the result for 'babad'.",
  "Write a Python function `coin_change(coins, amount)` that returns the fewest number of coins needed to make up a given amount. If it's not possible, return -1. Print the result for coins `[1, 2, 5]` and amount `11`.",
  "Write a Python function `word_break(s, wordDict)` that returns true if string `s` can be segmented into a space-separated sequence of one or more dictionary words from `wordDict`. Print the result for `s = 'leetcode'` and `wordDict = ['leet', 'code']`.",
  "Write a Python function `trap_rain_water(height)` where `height` is a list representing an elevation map. Compute how much water it can trap after raining. Print the result for `[0,1,0,2,1,0,1,3,2,1,2,1]`.",
  "Write a Python function `median_of_two_sorted_arrays(nums1, nums2)` that finds the median of two sorted arrays. Print the median for `[1, 3]` and `[2]`.",
  "Write a Python function `serialize_deserialize_binary_tree(root)` that designs an algorithm to serialize and deserialize a binary tree. Implement `serialize` (returns string) and `deserialize` (returns root node) methods, possibly within a class. Demonstrate by creating a simple tree, serializing it, deserializing it back, and printing a value from the deserialized tree to confirm.",
];

export function getRandomTask(excludeTask: string | null = null): string {
  let availableTasks = tasks;
  if (excludeTask) {
    availableTasks = tasks.filter((t) => t !== excludeTask);
  }
  if (availableTasks.length === 0) {
    return tasks[Math.floor(Math.random() * tasks.length)];
  }
  const randomIndex = Math.floor(Math.random() * availableTasks.length);
  return availableTasks[randomIndex];
}
