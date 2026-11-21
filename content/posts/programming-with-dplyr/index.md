---
title: 'Programming with R {dplyr} - As I Understand It!!'
subtitle: 'How to create your own functions using {dplyr}'
description: >-
  This post demonstrates how to write your own dynamic functions using popular
  `dplyr` verbs like `select()`, `filter()`, `mutate()`, `arrange()` and
  `group_by()` with `summarise()`. 
date: '2021-07-17'
image: images/H9jo8OB.webp
categories:
  - R
  - dplyr
  - functions
---

# Introduction

The purpose of this article is to act as a quick guide for myself and others to understand how to use `dplyr` effectively to create dynamic functions. The general assumption is that the reader is familiar with the `{dplyr}` package and how to use it for data wrangling.

### Inspiration

I regularly deal with event-related information with event date and few other columns like event type, root cause etc. Most reports usually involve calculating number of events that took place on a monthly, quarterly or annual basis, sometimes split by event type, root cause and other columns. After a few reports I realized that I am basically writing the same code over and over again to calculate these KPIs. Keeping the `DRY`^[**D**on't **R**epeat **Y**ourself] principle in mind, I managed to write a few functions to calculate these KPIs with a few dynamic variables. Following is an attempt to articulate what I learnt while creating those functions.

### Data

We shall use the Texas Housing Sales data, available as a tibble in the popular `ggplot2` package as reference data. It contains monthly information about the housing market in Texas provided by the TAMU real estate center, <https://www.recenter.tamu.edu/>. It has 8602 observations and 9 variables.

```r
txhousing <- ggplot2::txhousing
dplyr::glimpse(txhousing)
```

```output
Rows: 8,602
Columns: 9
$ city      <chr> "Abilene", "Abilene", "Abilene", "Abilene", "Abilene", "Abil~
$ year      <int> 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, ~
$ month     <int> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, ~
$ sales     <dbl> 72, 98, 130, 98, 141, 156, 152, 131, 104, 101, 100, 92, 75, ~
$ volume    <dbl> 5380000, 6505000, 9285000, 9730000, 10590000, 13910000, 1263~
$ median    <dbl> 71400, 58700, 58100, 68600, 67300, 66900, 73500, 75000, 6450~
$ listings  <dbl> 701, 746, 784, 785, 794, 780, 742, 765, 771, 764, 721, 658, ~
$ inventory <dbl> 6.3, 6.6, 6.8, 6.9, 6.8, 6.6, 6.2, 6.4, 6.5, 6.6, 6.2, 5.7, ~
$ date      <dbl> 2000.000, 2000.083, 2000.167, 2000.250, 2000.333, 2000.417, ~
```

We shall refer the above data in all the following sections.

# `select()`

When using `dplyr` functions, the two most popular ways to pass column names is either as bare names i.e. column names without enclosing them in quotes like `sales` or `volume` OR pass them as a character string like double-quote "sales" or single-quote 'volume'. You could also pass a character vector like `c("sales", "volume")`. In this section we will explore the 3 ways to dynamically select the columns we want.

### Passing raw column names

In this method, we pass the raw name of the column we want to select and use the `embrace` of curly-curly brackets to pass the raw name. For multiple columns, we can pass the raw names as a single vector.

```r
select_raw <- function(df, var) {
  
  # embrace of curly-curly {{}} brackets
  dplyr::select(.data = df, {{var}}) %>%     
    head()
}

# pass single raw name
select_raw(txhousing, sales)
```

```output
# A tibble: 6 x 1
  sales
  <dbl>
1    72
2    98
3   130
4    98
5   141
6   156
```

```r
# pass a vector of raw names for multiple columns
select_raw(txhousing, c(sales, volume))      
```

```output
# A tibble: 6 x 2
  sales   volume
  <dbl>    <dbl>
1    72  5380000
2    98  6505000
3   130  9285000
4    98  9730000
5   141 10590000
6   156 13910000
```

If passing multiple raw names as vector as in the `select_raw()` feels like an unnecessary complication, try the next method.

### Passing multiple raw column names using `...` argument

In this method, we use the `...` argument to pass the raw names of the columns we want to select.

```r
my_select <- function(df, ...) {
  dplyr::select(.data = df, ...) %>% 
    head()
}

# pass multiple raw names directly
my_select(txhousing, sales, volume)          
```

```output
# A tibble: 6 x 2
  sales   volume
  <dbl>    <dbl>
1    72  5380000
2    98  6505000
3   130  9285000
4    98  9730000
5   141 10590000
6   156 13910000
```

### Passing a character vector of column names

If we have the column names as a character vector, we use the `all_of` function to pass the character vector to the internal `select` function.

```r
my_select_char <- function(df, cols) {
  dplyr::select(.data = df, dplyr::all_of(cols)) %>% 
    head()
}

my_cols <- c("sales","volume")
my_select_char(txhousing, my_cols)
```

```output
# A tibble: 6 x 2
  sales   volume
  <dbl>    <dbl>
1    72  5380000
2    98  6505000
3   130  9285000
4    98  9730000
5   141 10590000
6   156 13910000
```

# `filter()`

In the previous section, we passed column names either as bare names or character strings. `filter()` takes one or more expressions/conditions that result in a logical vector, with same length as number of rows in the data.frame/tibble and returns only those rows for which the expression/condition returns `TRUE`. Following are 2 ways to pass these logical expressions/conditions. I'm using expression and condition interchangeably here. In this context, a condition is an expression that results in a boolean `TRUE/FALSE` result.

### Passing single raw criteria

In this method, we pass the condition `sales > 8000` as a raw/bare expression.

```r
filter_raw <- function(df, cond) {
  
  # embrace of curly-curly {{}} brackets
  dplyr::filter(.data = df, {{cond}})        
}

# Pass a single raw criterion
filter_raw(txhousing, sales > 8000)
```

```output
# A tibble: 10 x 9
   city     year month sales     volume median listings inventory  date
   <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
 1 Houston  2006     5  8040 1602621368 151200    35398       5.5 2006.
 2 Houston  2006     6  8628 1795898108 155200    36281       5.6 2006.
 3 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
 4 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
 5 Houston  2013     8  8155 2083377894 186700    21366       3.3 2014.
 6 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
 7 Houston  2014     7  8391 2278932511 199700    20214       3   2014.
 8 Houston  2014     8  8167 2195184825 202400    20007       2.9 2015.
 9 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
10 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
```

Do you think we can pass multiple bare conditions as a vector, like we did for `select_raw()` in the previous section? Let us try passing multiple raw criteria as a vector.

```r
filter_raw(txhousing, c(sales > 8000, year > 2010))
```

```output-error
Error in `dplyr::filter()`:
! Problem while computing `..1 = c(sales > 8000, year > 2010)`.
x Input `..1` must be of size 8602 or 1, not size 17204.
```

> [!NOTE] Vector Concatenation
> Passing multiple raw criteria as a vector doesn't work like it works for `select_raw()` function. Let us understand why. Consider the following code:
>
>
>
> ```r
> A <- c(TRUE, TRUE)      # boolean vector of length = 2
> B <- c(FALSE, FALSE)    # boolean vector of length = 2
> X <- c(A, B)
> X
> ```
>
> ```output
> [1]  TRUE  TRUE FALSE FALSE
> ```
>
>
> Notice that length of X is 4. Similarly, `sales > 8000` evaluates to a TRUE/FALSE boolean vector of length 8602 (equal to number of rows in `txhousing`) and so does `year > 2010`. So the vector `c(sales > 8000, year > 2010)` becomes a TRUE/FALSE boolean vector of length 17204, which results in an error.

### Passing multiple raw criteria using ... argument

To pass multiple raw criteria, we can use the `...` argument.

```r
my_filter <- function(df, ...) { 
  
  # pass the dots argument
  dplyr::filter(.data = df, ...)
  }

# pass multiple raw criteria
my_filter(txhousing, sales > 8000, year > 2010) 
```

```output
# A tibble: 8 x 9
  city     year month sales     volume median listings inventory  date
  <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
2 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
3 Houston  2013     8  8155 2083377894 186700    21366       3.3 2014.
4 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
5 Houston  2014     7  8391 2278932511 199700    20214       3   2014.
6 Houston  2014     8  8167 2195184825 202400    20007       2.9 2015.
7 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
8 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
```

### Passing single criteria as a character string

By default, `dplyr::filter()` does not accept conditions as character strings. Following is an example which results in error

```r
dplyr::filter(txhousing, "sales > 8000")
```

```output-error
Error in `dplyr::filter()`:
! Problem while computing `..1 = "sales > 8000"`.
x Input `..1` must be a logical vector, not a character.
```

We need to convert the character condition into a raw expression.

```r
my_filter_string <- function(df, cond) {
  
  # convert text to raw criterion
  dplyr::filter(.data = df, eval(parse(text = cond))) 
}

# pass single text string as criteria
my_filter_string(txhousing, "sales > 8000")  
```

```output
# A tibble: 10 x 9
   city     year month sales     volume median listings inventory  date
   <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
 1 Houston  2006     5  8040 1602621368 151200    35398       5.5 2006.
 2 Houston  2006     6  8628 1795898108 155200    36281       5.6 2006.
 3 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
 4 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
 5 Houston  2013     8  8155 2083377894 186700    21366       3.3 2014.
 6 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
 7 Houston  2014     7  8391 2278932511 199700    20214       3   2014.
 8 Houston  2014     8  8167 2195184825 202400    20007       2.9 2015.
 9 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
10 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
```

The special sauce here is the `eval(parse(text = ...))` combo that converts the long text criteria into a single raw criteria and passes it to the internal `filter()` function.

### Passing multiple criteria as character vector

What if want to pass multiple criteria as a string vector? In such a situation, we must combine all the string conditions into a single long string condition using `paste0(..., collapse = " & ")`. The `paste0("(", cond, ")", collapse = " & ")` combines all the criteria into a single long criteria, but still a text string.

```r
my_filter_strings <- function(df, cond) { 
  
  # combine all criteria
  filter_text <- paste0("(", cond, ")", collapse = " & ")
  
  # (OPTIONAL) show the combined filter string
  message("Filter Condition: ", filter_text)
  
  # convert text to raw criterion
  dplyr::filter(.data = df, eval(parse(text = filter_text)))
  }

my_filter_criteria <- c("sales > 8000", "year > 2010")
my_filter_strings(txhousing, my_filter_criteria)
```

```output-stderr
Filter Condition: (sales > 8000) & (year > 2010)
```

```output
# A tibble: 8 x 9
  city     year month sales     volume median listings inventory  date
  <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
2 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
3 Houston  2013     8  8155 2083377894 186700    21366       3.3 2014.
4 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
5 Houston  2014     7  8391 2278932511 199700    20214       3   2014.
6 Houston  2014     8  8167 2195184825 202400    20007       2.9 2015.
7 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
8 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
```

> [!CAUTION] OR Condition
> To create an OR condition, the expression must be a single string separated by pipe '\|' as in example below.

```r
my_filter_criteria_with_OR <- c("sales > 8000 | sales < 50", "year > 2010")
my_filter_strings(txhousing, my_filter_criteria_with_OR)
```

```output-stderr
Filter Condition: (sales > 8000 | sales < 50) & (year > 2010)
```

```output
# A tibble: 315 x 9
   city         year month sales  volume median listings inventory  date
   <chr>       <int> <int> <dbl>   <dbl>  <dbl>    <dbl>     <dbl> <dbl>
 1 Brownsville  2011     1    48 4974408  83300      784      12.6 2011 
 2 Brownsville  2011     2    47 5558575 101400      776      12.7 2011.
 3 Brownsville  2011     7    47 4807019  91200      749      13.1 2012.
 4 Brownsville  2011    12    39 4203440  86800      726      12.4 2012.
 5 Brownsville  2012     1    43 3892348  85000      791      13.6 2012 
 6 Brownsville  2012     3    27 2976148  93800      734      13.3 2012.
 7 Brownsville  2012    11    41 5115393  99000      807      14   2013.
 8 Brownsville  2013    11    38 4824930 108000      859      13.4 2014.
 9 Brownsville  2015     1    41 5400796  97000      733      10.7 2015 
10 Galveston    2011     1    43 8882961 170000     1015      13.7 2011 
# ... with 305 more rows
```

# `mutate()`

`mutate()` allows you to add new columns or modify existing columns. In the example below, we will create a new column `volume_in_millions` from the existing column `volume`. The names of both the columns can be passed to the function either as raw names or character strings.

### Passing the column name as raw name

```r
mutate_raw <- function(df, new_col_raw, old_col_raw, num = 1) { 
  dplyr::mutate(.data = df, {{new_col_raw}} := {{old_col_raw}}/num) %>% 
    head()
}

txhousing %>% 
  select(city, year, month, volume) %>% 
  # pass raw column names w/o quotes
  mutate_raw(vol_in_millions, volume, 1E6) 
```

```output
# A tibble: 6 x 5
  city     year month   volume vol_in_millions
  <chr>   <int> <int>    <dbl>           <dbl>
1 Abilene  2000     1  5380000            5.38
2 Abilene  2000     2  6505000            6.50
3 Abilene  2000     3  9285000            9.28
4 Abilene  2000     4  9730000            9.73
5 Abilene  2000     5 10590000           10.6 
6 Abilene  2000     6 13910000           13.9 
```

### Passing the new variable name as character string (direct)

```r
mutate_text <- function(df, new_col_str, old_col_str, num = 1) { 
  dplyr::mutate(.data = df, {{new_col_str}} := df[[old_col_str]]/num) %>% 
    head()
}

txhousing %>% 
  select(city, year, month, volume) %>%
  # pass column names as strings
  mutate_text("vol_in_millions", "volume", 1E6) 
```

```output
# A tibble: 6 x 5
  city     year month   volume vol_in_millions
  <chr>   <int> <int>    <dbl>           <dbl>
1 Abilene  2000     1  5380000            5.38
2 Abilene  2000     2  6505000            6.50
3 Abilene  2000     3  9285000            9.28
4 Abilene  2000     4  9730000            9.73
5 Abilene  2000     5 10590000           10.6 
6 Abilene  2000     6 13910000           13.9 
```

### Passing the new variable name as character string (indirect)

Instead of passing the name of the variable as a character string as an argument, we can pass a variable containing the name of the variable. In the below example, the name of the new variable is stored in `new_var`. Using the new `{glue}` syntax, enabled by the walrus operator `:=`, we substitute the `new_var` variable with its value.

```r
mutate_var <- function(df, new_col_var, old_col_var, num = 1) {
  dplyr::mutate(.data = df, "{new_col_var}" := df[[old_col_var]]/num) %>% 
    head()
}

new_var <- "vol_in_millions"
old_var <- "volume"

txhousing %>% 
  select(city, year, month, volume) %>%
  # pass column names as variables
  mutate_var(new_var, old_var, 1E6)  
```

```output
# A tibble: 6 x 5
  city     year month   volume vol_in_millions
  <chr>   <int> <int>    <dbl>           <dbl>
1 Abilene  2000     1  5380000            5.38
2 Abilene  2000     2  6505000            6.50
3 Abilene  2000     3  9285000            9.28
4 Abilene  2000     4  9730000            9.73
5 Abilene  2000     5 10590000           10.6 
6 Abilene  2000     6 13910000           13.9 
```

# `arrange()`

`arrange()` sorts the rows of a data frame by the values of selected columns. By default, it sorts in Ascending order. To force a column to sort in Descending order, we must use the `desc()` function.

### Passing single raw name

```r
arrange_raw <- function(df, var) {
  
  # embrace of curly-curly {{}} brackets
  dplyr::arrange(.data = df, {{var}}) %>%    
    head()
}

arrange_raw(txhousing, sales)
```

```output
# A tibble: 6 x 9
  city                year month sales  volume median listings inventory  date
  <chr>              <int> <int> <dbl>   <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 San Marcos          2011    10     6 1156999 180000      163       8.3 2012.
2 Harlingen           2000     7     9 1110000  87500      719      30.8 2000.
3 South Padre Island  2011     1     9 2088500 225000     1258      55.7 2011 
4 San Marcos          2011     1    10 1482310 140000      165       7.5 2011 
5 San Marcos          2011    12    10 1561250 140000      148       8   2012.
6 San Marcos          2014    11    10 1506878 146700       96       4   2015.
```

```r
arrange_raw(txhousing, desc(sales))
```

```output
# A tibble: 6 x 9
  city     year month sales     volume median listings inventory  date
  <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
2 Houston  2006     6  8628 1795898108 155200    36281       5.6 2006.
3 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
4 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
5 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
6 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
```

`arrange_raw()` fails when we pass multiple raw names as a vector.

```r
arrange_raw(txhousing, c(sales, volume))
```

```output-error
Error in `dplyr::arrange()`:
! Problem with the implicit `transmute()` step.
x Problem while computing `..1 = c(sales, volume)`.
x `..1` must be size 8602 or 1, not 17204.
```

### Passing multiple raw names using `...` argument

To pass multiple raw names, we must use the `...` argument.

```r
arrange_raw_multiple <- function(df, ...) {
  dplyr::arrange(.data = df, ...) %>% 
    head()
}

arrange_raw_multiple(txhousing, city, sales)
```

```output
# A tibble: 6 x 9
  city     year month sales  volume median listings inventory  date
  <chr>   <int> <int> <dbl>   <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Abilene  2003     1    68 5385000  70000      668       5.4  2003
2 Abilene  2011     1    68 8834493 123300      809       6.1  2011
3 Abilene  2009     1    70 8414801  92900      861       6.3  2009
4 Abilene  2000     1    72 5380000  71400      701       6.3  2000
5 Abilene  2010     1    73 9130783 112200      868       6.4  2010
6 Abilene  2001     1    75 5730000  64500      779       6.8  2001
```

```r
arrange_raw_multiple(txhousing, city, desc(sales))
```

```output
# A tibble: 6 x 9
  city     year month sales   volume median listings inventory  date
  <chr>   <int> <int> <dbl>    <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Abilene  2015     7   268 45845730 148700      986       5   2016.
2 Abilene  2015     6   260 41396230 141500      965       5   2015.
3 Abilene  2007     7   239 29315000 114300      940       5.2 2008.
4 Abilene  2013     8   236 30777727 120000      976       5.4 2014.
5 Abilene  2014     7   231 35861350 145800     1033       5.8 2014.
6 Abilene  2005     6   230 24050000  92500      664       4.1 2005.
```

### Pass single column name as string

```r
arrange_str <- function(df, var, .desc = FALSE) {
  if (.desc) {
    dplyr::arrange(.data = df, desc(df[[var]])) %>% head()
  } else {
    dplyr::arrange(.data = df, df[[var]]) %>% head()
  }
}

arrange_str(txhousing, "sales")
```

```output
# A tibble: 6 x 9
  city                year month sales  volume median listings inventory  date
  <chr>              <int> <int> <dbl>   <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 San Marcos          2011    10     6 1156999 180000      163       8.3 2012.
2 Harlingen           2000     7     9 1110000  87500      719      30.8 2000.
3 South Padre Island  2011     1     9 2088500 225000     1258      55.7 2011 
4 San Marcos          2011     1    10 1482310 140000      165       7.5 2011 
5 San Marcos          2011    12    10 1561250 140000      148       8   2012.
6 San Marcos          2014    11    10 1506878 146700       96       4   2015.
```

```r
arrange_str(txhousing, "sales", .desc = TRUE)
```

```output
# A tibble: 6 x 9
  city     year month sales     volume median listings inventory  date
  <chr>   <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Houston  2015     7  8945 2568156780 217600    23875       3.4 2016.
2 Houston  2006     6  8628 1795898108 155200    36281       5.6 2006.
3 Houston  2013     7  8468 2168720825 187800    21497       3.3 2014.
4 Houston  2015     6  8449 2490238594 222400    22311       3.2 2015.
5 Houston  2013     5  8439 2121508529 186100    20526       3.3 2013.
6 Houston  2014     6  8391 2342443127 211200    19725       2.9 2014.
```

### Pass multiple column name as string

```r
arrange_str_multiple <- function(df, var, desc = FALSE) {
  if (desc) {
    dplyr::arrange(.data = df, desc(df[var])) %>% head()
  } else {
    dplyr::arrange(.data = df, df[var]) %>% head()
  }
}

# This function arranges the dataframe either all ascending
# or all descending. Definitely need a better example.

arrange_str_multiple(txhousing, c("year", "month", "sales"))
```

```output
# A tibble: 6 x 9
  city         year month sales  volume median listings inventory  date
  <chr>       <int> <int> <dbl>   <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Paris        2000     1    19 1440000  71700      286       7.5  2000
2 San Marcos   2000     1    22 2380000 106700      190       6.3  2000
3 Lufkin       2000     1    28 2280000  68000       NA      NA    2000
4 Harlingen    2000     1    31 3910000  87500      644      24.9  2000
5 Galveston    2000     1    37 4555000  95000      636       9.1  2000
6 Port Arthur  2000     1    40 3090000  68300      314       5.6  2000
```

```r
arrange_str_multiple(txhousing, c("year", "month", "sales"), desc = TRUE)
```

```output
# A tibble: 6 x 9
  city           year month sales     volume median listings inventory  date
  <chr>         <int> <int> <dbl>      <dbl>  <dbl>    <dbl>     <dbl> <dbl>
1 Houston        2015     7  8945 2568156780 217600    23875       3.4 2016.
2 Dallas         2015     7  7038 2021907410 233000    12292       2.4 2016.
3 Austin         2015     7  3466 1150381553 264600     7913       3   2016.
4 San Antonio    2015     7  2962  704891602 198100     9462       4.1 2016.
5 Collin County  2015     7  1861  613669702 292600     2809       2.1 2016.
6 Fort Bend      2015     7  1372  431875327 280400     3328       3.1 2016.
```

# `group_by()`

In `group_by()`, we *select* which columns to, well, group by! (Damn these well-named functions!). So one can use the same techniques as `select()` to choose the columns.

In the following examples, we will create only one summarised value `total_sales` for simplicity.

### Passing single raw name

```r
group_raw <- function(df, grp) {
  df %>% 
    group_by({{grp}}) %>% 
    summarise(total_sales = sum(sales, na.rm = TRUE),
              .groups = 'drop')  %>% 
    head(n=5)
}

# Sum of sales per year
group_raw(txhousing, year)
```

```output
# A tibble: 5 x 2
   year total_sales
  <int>       <dbl>
1  2000      222483
2  2001      231453
3  2002      234600
4  2003      253909
5  2004      283999
```

```r
# Sum of sales per month
group_raw(txhousing, month)       
```

```output
# A tibble: 5 x 2
  month total_sales
  <int>       <dbl>
1     1      245924
2     2      296410
3     3      386909
4     4      397332
5     5      448968
```

### Passing multiple raw names using the `...` operator

```r
group_raw_multiple <- function(df, ...) {
  df %>% 
    group_by(...) %>% 
    summarise(total_sales = sum(sales, na.rm = TRUE),
              .groups = 'drop')  %>% 
    head(n = 5)
}

# Sum of sales per year
group_raw_multiple(txhousing, year)
```

```output
# A tibble: 5 x 2
   year total_sales
  <int>       <dbl>
1  2000      222483
2  2001      231453
3  2002      234600
4  2003      253909
5  2004      283999
```

```r
# Sum of sales per month
group_raw_multiple(txhousing, year, month)     
```

```output
# A tibble: 5 x 3
   year month total_sales
  <int> <int>       <dbl>
1  2000     1       11411
2  2000     2       15674
3  2000     3       20202
4  2000     4       18658
5  2000     5       22388
```

### Passing single or multiple column names as character string

```r
group_str <- function(df, grp) {
  df %>% 
    group_by(df[grp]) %>% 
    summarise(total_sales = sum(sales, na.rm = TRUE),
              .groups = 'drop')  %>% 
    head(n=5)
}

# Sum of sales per year
group_str(txhousing, "year")
```

```output
# A tibble: 5 x 2
   year total_sales
  <int>       <dbl>
1  2000      222483
2  2001      231453
3  2002      234600
4  2003      253909
5  2004      283999
```

```r
# Sum of sales per month
group_str(txhousing, c("year", "month"))       
```

```output
# A tibble: 5 x 3
   year month total_sales
  <int> <int>       <dbl>
1  2000     1       11411
2  2000     2       15674
3  2000     3       20202
4  2000     4       18658
5  2000     5       22388
```

```r
# The same column names can be passed as variables containing the character names
yr <- "year"
group_str(txhousing, yr)
```

```output
# A tibble: 5 x 2
   year total_sales
  <int>       <dbl>
1  2000      222483
2  2001      231453
3  2002      234600
4  2003      253909
5  2004      283999
```

```r
yrmon <- c("year", "month")
group_str(txhousing, yrmon)
```

```output
# A tibble: 5 x 3
   year month total_sales
  <int> <int>       <dbl>
1  2000     1       11411
2  2000     2       15674
3  2000     3       20202
4  2000     4       18658
5  2000     5       22388
```

If you want the summarised column to have a custom name like `total_<sumvar>`, then you can wrap the value in quotes as below. This method uses the `glue` syntax enabled by the `:=` walrus operator. The walrus operator takes either a raw name or a character string on its LHS.

```r
group_raw2 <- function(df, grp, sumvar) {
  df %>% 
    group_by({{grp}}) %>% 
    summarise("total_{{sumvar}}" := sum({{sumvar}}, na.rm = TRUE),
              .groups = 'drop')  %>% 
    head(n=5)
}

# Sum of sales per year
group_raw2(txhousing, year, sales)
```

```output
# A tibble: 5 x 2
   year total_sales
  <int>       <dbl>
1  2000      222483
2  2001      231453
3  2002      234600
4  2003      253909
5  2004      283999
```

```r
# Sum of listings per month
group_raw2(txhousing, month, listings)
```

```output
# A tibble: 5 x 2
  month total_listings
  <int>          <dbl>
1     1        1854661
2     2        1888104
3     3        1949187
4     4        1991278
5     5        2038932
```

After writing so many examples, I see a pattern. `group_by()` works with techniques similar to `select()` while `summarise()` works with techniques similar to `mutate()`.

# (Slightly Better) Examples

The `txhousing` is a city-wise monthly sales and volume dataset. It has a `year` and `month` column. Let us create a `date` column and keep only those columns relevant for our custom `tx_summary()` function.

```r
small_df <- txhousing %>% 
  mutate(date = lubridate::as_date(glue::glue("{year}-{month}-01"))) %>% 
  select(city, date, sales, volume)
```

### `mutate()` example

Now let us create the `create_ymq()` function. This function would take 2 arguments, a data frame `df` and a raw name of a date column.

```r
create_ymq <- function(df, date_col) {
  stopifnot(inherits(df, "data.frame"))
  stopifnot(class(df %>% dplyr::pull({{date_col}})) == 'Date')
  mutate(df,
         Year = lubridate::year({{date_col}}),
         nHalf = lubridate::semester({{date_col}}),
         yHalf = lubridate::semester({{date_col}}, with_year = TRUE),
         dHalf = paste0(lubridate::semester({{date_col}}), "H", format({{date_col}},"%y")),
         nQtr = lubridate::quarter({{date_col}}),
         yQtr = lubridate::quarter({{date_col}}, with_year = TRUE),
         dQtr = paste0(lubridate::quarter({{date_col}}),"Q", format({{date_col}},"%y")),
         Month = lubridate::month({{date_col}}),
         yMonth = as.numeric(format({{date_col}}, "%Y.%m")),
         dMonth = format({{date_col}}, "%b %Y")
         )
}

create_ymq(df = small_df, date_col = date) %>% glimpse()
```

```output
Rows: 8,602
Columns: 14
$ city   <chr> "Abilene", "Abilene", "Abilene", "Abilene", "Abilene", "Abilene~
$ date   <date> 2000-01-01, 2000-02-01, 2000-03-01, 2000-04-01, 2000-05-01, 20~
$ sales  <dbl> 72, 98, 130, 98, 141, 156, 152, 131, 104, 101, 100, 92, 75, 112~
$ volume <dbl> 5380000, 6505000, 9285000, 9730000, 10590000, 13910000, 1263500~
$ Year   <dbl> 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 200~
$ nHalf  <int> 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, ~
$ yHalf  <dbl> 2000.1, 2000.1, 2000.1, 2000.1, 2000.1, 2000.1, 2000.2, 2000.2,~
$ dHalf  <chr> "1H00", "1H00", "1H00", "1H00", "1H00", "1H00", "2H00", "2H00",~
$ nQtr   <int> 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 1, 1, 1, 2, 2, 2, 3, 3, 3, ~
$ yQtr   <dbl> 2000.1, 2000.1, 2000.1, 2000.2, 2000.2, 2000.2, 2000.3, 2000.3,~
$ dQtr   <chr> "1Q00", "1Q00", "1Q00", "2Q00", "2Q00", "2Q00", "3Q00", "3Q00",~
$ Month  <dbl> 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, ~
$ yMonth <dbl> 2000.01, 2000.02, 2000.03, 2000.04, 2000.05, 2000.06, 2000.07, ~
$ dMonth <chr> "Jan 2000", "Feb 2000", "Mar 2000", "Apr 2000", "May 2000", "Ju~
```

### `group_by()` example

Now that we have a function that creates various date-related columns, let us create a function that let's you create summary tables like annual sales per city, quarterly volumes per city etc.

```r
tx_summary <- function(df, grp_col, sum_col) {
  df %>% 
    group_by(city, {{grp_col}}) %>% 
    summarise("total_{{sum_col}}" := sum({{sum_col}}, na.rm = TRUE), .groups = 'drop')
}
```

Using these 2 functions, we can now create multiple summary tables

```r
small_df_with_date_cols <- small_df %>% 
  create_ymq(date_col = date)

# Annual Sales per city
small_df_with_date_cols %>% 
  tx_summary(grp_col = Year, sum_col = sales)
```

```output
# A tibble: 736 x 3
   city     Year total_sales
   <chr>   <dbl>       <dbl>
 1 Abilene  2000        1375
 2 Abilene  2001        1431
 3 Abilene  2002        1516
 4 Abilene  2003        1632
 5 Abilene  2004        1830
 6 Abilene  2005        1977
 7 Abilene  2006        1997
 8 Abilene  2007        2003
 9 Abilene  2008        1651
10 Abilene  2009        1634
# ... with 726 more rows
```

```r
# Half Yearly volumes per city
small_df_with_date_cols %>% 
  tx_summary(grp_col = yHalf, sum_col = volume)
```

```output
# A tibble: 1,472 x 3
   city    yHalf total_volume
   <chr>   <dbl>        <dbl>
 1 Abilene 2000.     55400000
 2 Abilene 2000.     53175000
 3 Abilene 2001.     55795000
 4 Abilene 2001.     58570000
 5 Abilene 2002.     55305000
 6 Abilene 2002.     63370000
 7 Abilene 2003.     58175000
 8 Abilene 2003.     77500000
 9 Abilene 2004.     74205000
10 Abilene 2004.     85465000
# ... with 1,462 more rows
```

```r
# Quarterly Sales per city
small_df_with_date_cols %>% 
  tx_summary(grp_col = yQtr, sum_col = sales)
```

```output
# A tibble: 2,898 x 3
   city     yQtr total_sales
   <chr>   <dbl>       <dbl>
 1 Abilene 2000.         300
 2 Abilene 2000.         395
 3 Abilene 2000.         387
 4 Abilene 2000.         293
 5 Abilene 2001.         305
 6 Abilene 2001.         394
 7 Abilene 2001.         401
 8 Abilene 2001.         331
 9 Abilene 2002.         295
10 Abilene 2002.         425
# ... with 2,888 more rows
```

```r
# Monthly Volumes per city
small_df_with_date_cols %>% 
  tx_summary(grp_col = yMonth, sum_col = volume)
```

```output
# A tibble: 8,602 x 3
   city    yMonth total_volume
   <chr>    <dbl>        <dbl>
 1 Abilene  2000.      5380000
 2 Abilene  2000.      6505000
 3 Abilene  2000.      9285000
 4 Abilene  2000.      9730000
 5 Abilene  2000.     10590000
 6 Abilene  2000.     13910000
 7 Abilene  2000.     12635000
 8 Abilene  2000.     10710000
 9 Abilene  2000.      7615000
10 Abilene  2000.      7040000
# ... with 8,592 more rows
```

### More ideas

You could further extend this by creating a custom filtering function that gives you, say, the rows with the highest or lowest `total_sales` or `total_volume`.

# Conclusion

The ability to create such dynamic functions, enabled by the wonderful {dplyr} package, allows us to level-up in terms of programming with R and helps make our code neat and tidy.

![How I feel while creating custom functions with {dplyr}! I can almost hear the music! Source: imgur.com](images/H9jo8OB.webp)

# References

-   Hadley Wickham, Romain François, Lionel Henry and Kirill Müller (2022). dplyr: A Grammar of Data Manipulation. R package version 1.0.9. https://CRAN.R-project.org/package=dplyr
-   https://dplyr.tidyverse.org/articles/programming.html
-   H. Wickham. ggplot2: Elegant Graphics for Data Analysis. Springer-Verlag New York, 2016. https://ggplot2.tidyverse.org
-   Jim Hester and Jennifer Bryan (2022). glue: Interpreted String Literals. R package version 1.6.2. https://CRAN.R-project.org/package=glue
