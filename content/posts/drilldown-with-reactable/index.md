---
title: 'Interactive Drill-down Tables using {reactable}'
subtitle: How to create multi-level tables with hidden rows
description: >-
  This post demonstrates how to use the {reactable} package to create
  multi-level drill-down tables having hidden rows
date: '2021-07-27'
image: images/Zzk5SWf.webp
categories:
  - R
  - reactable
  - drill-down
scripts:
  - /vendor/htmlwidgets/core-js-2.5.3/shim.min.js
  - /vendor/htmlwidgets/react-17.0.0/react.min.js
  - /vendor/htmlwidgets/react-17.0.0/react-dom.min.js
  - /vendor/htmlwidgets/reactwidget-1.0.0/react-tools.js
  - /vendor/htmlwidgets/htmlwidgets-1.5.4/htmlwidgets.js
  - /vendor/htmlwidgets/reactable-binding-0.3.0/reactable.js
---

We often come across denormalized data that has 2 or more levels of information. For example, top-level info like course info with data fields like course id, course name, description, start/end date and second-level info like student info with data fields like with student id, student name, age and gender. We may also have these two groups of data as separate tables with a primary-key foreign-key design, usually from a well-designed SQL database.

> [!NOTE]
> If you are reading this article from anywhere except https://vishalkatti.com, you may not see some of the interactive elements below. Go to [original post here](https://www.vishalkatti.com/posts/drilldown-with-reactable/)

Let us create some data.

## Top-Level data: **course**

```r
library(dplyr, quietly = TRUE, warn.conflicts = FALSE)
library(rmarkdown, quietly = TRUE, warn.conflicts = FALSE)

course <- tibble(course_id   = 1:4,
                 course_name = paste("Course", LETTERS[1:4]),
                 start_date  = seq.Date(from = lubridate::as_date("2021-01-01"), by = "month", length.out = 4),
                 end_date    = lubridate::ceiling_date(start_date, unit = "month") - 1)

paged_table(course)
```

<div class="table-wrap data-table"><table>
<thead><tr><th style="text-align:right">course_id<span class="col-type">int</span></th><th style="text-align:left">course_name<span class="col-type">chr</span></th><th style="text-align:right">start_date<span class="col-type">date</span></th><th style="text-align:right">end_date<span class="col-type">date</span></th></tr></thead>
<tbody>
<tr><td style="text-align:right">1</td><td style="text-align:left">Course A</td><td style="text-align:right">2021-01-01</td><td style="text-align:right">2021-01-31</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Course D</td><td style="text-align:right">2021-04-01</td><td style="text-align:right">2021-04-30</td></tr>
</tbody>
</table></div>

## Second Level Data: **student**

```r
set.seed(42)
student <- tibble(s_id      = 1:20,
                  s_name    = paste("Student", LETTERS[1:20]),
                  gender    = sample(c("X","Y","Z"), 20, replace = TRUE),
                  age       = sample(18:35, 20, replace = TRUE),
                  course_id = sample(1:4, 20, replace = TRUE))

paged_table(student)
```

<div class="table-wrap data-table"><table>
<thead><tr><th style="text-align:right">s_id<span class="col-type">int</span></th><th style="text-align:left">s_name<span class="col-type">chr</span></th><th style="text-align:left">gender<span class="col-type">chr</span></th><th style="text-align:right">age<span class="col-type">int</span></th><th style="text-align:right">course_id<span class="col-type">int</span></th></tr></thead>
<tbody>
<tr><td style="text-align:right">1</td><td style="text-align:left">Student A</td><td style="text-align:left">X</td><td style="text-align:right">21</td><td style="text-align:right">3</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Student B</td><td style="text-align:left">X</td><td style="text-align:right">22</td><td style="text-align:right">4</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Student C</td><td style="text-align:left">X</td><td style="text-align:right">30</td><td style="text-align:right">3</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Student D</td><td style="text-align:left">X</td><td style="text-align:right">22</td><td style="text-align:right">1</td></tr>
<tr><td style="text-align:right">5</td><td style="text-align:left">Student E</td><td style="text-align:left">Y</td><td style="text-align:right">19</td><td style="text-align:right">1</td></tr>
<tr><td style="text-align:right">6</td><td style="text-align:left">Student F</td><td style="text-align:left">Y</td><td style="text-align:right">25</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">7</td><td style="text-align:left">Student G</td><td style="text-align:left">Y</td><td style="text-align:right">20</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">8</td><td style="text-align:left">Student H</td><td style="text-align:left">X</td><td style="text-align:right">18</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">9</td><td style="text-align:left">Student I</td><td style="text-align:left">Z</td><td style="text-align:right">27</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">10</td><td style="text-align:left">Student J</td><td style="text-align:left">Z</td><td style="text-align:right">28</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">11</td><td style="text-align:left">Student K</td><td style="text-align:left">X</td><td style="text-align:right">32</td><td style="text-align:right">4</td></tr>
<tr><td style="text-align:right">12</td><td style="text-align:left">Student L</td><td style="text-align:left">X</td><td style="text-align:right">25</td><td style="text-align:right">3</td></tr>
<tr><td style="text-align:right">13</td><td style="text-align:left">Student M</td><td style="text-align:left">Y</td><td style="text-align:right">21</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">14</td><td style="text-align:left">Student N</td><td style="text-align:left">Y</td><td style="text-align:right">21</td><td style="text-align:right">1</td></tr>
<tr><td style="text-align:right">15</td><td style="text-align:left">Student O</td><td style="text-align:left">Y</td><td style="text-align:right">35</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">16</td><td style="text-align:left">Student P</td><td style="text-align:left">Z</td><td style="text-align:right">30</td><td style="text-align:right">3</td></tr>
<tr><td style="text-align:right">17</td><td style="text-align:left">Student Q</td><td style="text-align:left">Z</td><td style="text-align:right">22</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">18</td><td style="text-align:left">Student R</td><td style="text-align:left">X</td><td style="text-align:right">21</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">19</td><td style="text-align:left">Student S</td><td style="text-align:left">X</td><td style="text-align:right">19</td><td style="text-align:right">2</td></tr>
<tr><td style="text-align:right">20</td><td style="text-align:left">Student T</td><td style="text-align:left">Z</td><td style="text-align:right">35</td><td style="text-align:right">4</td></tr>
</tbody>
</table></div>

If we are sourcing data from a database, it is probable that you would see these 2 levels of data in 2 separate tables/views, but most business users are comfortable with MS Excel and want **all the data in one sheet**!!

So the data actually looks something like this.

```r
combined_df <- left_join(course, student, by = "course_id")

paged_table(combined_df)
```

<div class="table-wrap data-table"><table>
<thead><tr><th style="text-align:right">course_id<span class="col-type">int</span></th><th style="text-align:left">course_name<span class="col-type">chr</span></th><th style="text-align:right">start_date<span class="col-type">date</span></th><th style="text-align:right">end_date<span class="col-type">date</span></th><th style="text-align:right">s_id<span class="col-type">int</span></th><th style="text-align:left">s_name<span class="col-type">chr</span></th><th style="text-align:left">gender<span class="col-type">chr</span></th><th style="text-align:right">age<span class="col-type">int</span></th></tr></thead>
<tbody>
<tr><td style="text-align:right">1</td><td style="text-align:left">Course A</td><td style="text-align:right">2021-01-01</td><td style="text-align:right">2021-01-31</td><td style="text-align:right">4</td><td style="text-align:left">Student D</td><td style="text-align:left">X</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">1</td><td style="text-align:left">Course A</td><td style="text-align:right">2021-01-01</td><td style="text-align:right">2021-01-31</td><td style="text-align:right">5</td><td style="text-align:left">Student E</td><td style="text-align:left">Y</td><td style="text-align:right">19</td></tr>
<tr><td style="text-align:right">1</td><td style="text-align:left">Course A</td><td style="text-align:right">2021-01-01</td><td style="text-align:right">2021-01-31</td><td style="text-align:right">14</td><td style="text-align:left">Student N</td><td style="text-align:left">Y</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">6</td><td style="text-align:left">Student F</td><td style="text-align:left">Y</td><td style="text-align:right">25</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">7</td><td style="text-align:left">Student G</td><td style="text-align:left">Y</td><td style="text-align:right">20</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">8</td><td style="text-align:left">Student H</td><td style="text-align:left">X</td><td style="text-align:right">18</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">9</td><td style="text-align:left">Student I</td><td style="text-align:left">Z</td><td style="text-align:right">27</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">10</td><td style="text-align:left">Student J</td><td style="text-align:left">Z</td><td style="text-align:right">28</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">13</td><td style="text-align:left">Student M</td><td style="text-align:left">Y</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">15</td><td style="text-align:left">Student O</td><td style="text-align:left">Y</td><td style="text-align:right">35</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">17</td><td style="text-align:left">Student Q</td><td style="text-align:left">Z</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">18</td><td style="text-align:left">Student R</td><td style="text-align:left">X</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">19</td><td style="text-align:left">Student S</td><td style="text-align:left">X</td><td style="text-align:right">19</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td><td style="text-align:right">1</td><td style="text-align:left">Student A</td><td style="text-align:left">X</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td><td style="text-align:right">3</td><td style="text-align:left">Student C</td><td style="text-align:left">X</td><td style="text-align:right">30</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td><td style="text-align:right">12</td><td style="text-align:left">Student L</td><td style="text-align:left">X</td><td style="text-align:right">25</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td><td style="text-align:right">16</td><td style="text-align:left">Student P</td><td style="text-align:left">Z</td><td style="text-align:right">30</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Course D</td><td style="text-align:right">2021-04-01</td><td style="text-align:right">2021-04-30</td><td style="text-align:right">2</td><td style="text-align:left">Student B</td><td style="text-align:left">X</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Course D</td><td style="text-align:right">2021-04-01</td><td style="text-align:right">2021-04-30</td><td style="text-align:right">11</td><td style="text-align:left">Student K</td><td style="text-align:left">X</td><td style="text-align:right">32</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Course D</td><td style="text-align:right">2021-04-01</td><td style="text-align:right">2021-04-30</td><td style="text-align:right">20</td><td style="text-align:left">Student T</td><td style="text-align:left">Z</td><td style="text-align:right">35</td></tr>
</tbody>
</table></div>

Displaying such data in a table causes all the top-level data fields to repeat for every second-level record. You can see that `course_id`, `course_name`, `start_date` and `end_date` columns repeat for all students who enrolled in the same course. Take a moment to think about how would you display such data in an interactive table in a web page, HTML report or Shiny app.

It is advisable to split such denormalized data into normalized data i.e. create the original top-level and second level tables from the `combined_df`.

## Vanilla `reactable`

One of my favorite R packages is `{reactable}`. The default output creates a neat interactive table with pagination (if data has more than 10 rows) and ability to sort columns.

```r
library(reactable, quietly = TRUE, warn.conflicts = FALSE)

reactable(data = combined_df)
```

<div id="htmlwidget-0420b066e36ce9489c4b" class="reactable html-widget" style="width:auto;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-0420b066e36ce9489c4b">{"x":{"tag":{"name":"Reactable","attribs":{"data":{"course_id":[1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4],"course_name":["Course A","Course A","Course A","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course C","Course C","Course C","Course C","Course D","Course D","Course D"],"start_date":["2021-01-01","2021-01-01","2021-01-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-03-01","2021-03-01","2021-03-01","2021-03-01","2021-04-01","2021-04-01","2021-04-01"],"end_date":["2021-01-31","2021-01-31","2021-01-31","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-03-31","2021-03-31","2021-03-31","2021-03-31","2021-04-30","2021-04-30","2021-04-30"],"s_id":[4,5,14,6,7,8,9,10,13,15,17,18,19,1,3,12,16,2,11,20],"s_name":["Student D","Student E","Student N","Student F","Student G","Student H","Student I","Student J","Student M","Student O","Student Q","Student R","Student S","Student A","Student C","Student L","Student P","Student B","Student K","Student T"],"gender":["X","Y","Y","Y","Y","X","Z","Z","Y","Y","Z","X","X","X","X","X","Z","X","X","Z"],"age":[22,19,21,25,20,18,27,28,21,35,22,21,19,21,30,25,30,22,32,35]},"columns":[{"accessor":"course_id","name":"course_id","type":"numeric"},{"accessor":"course_name","name":"course_name","type":"character"},{"accessor":"start_date","name":"start_date","type":"Date"},{"accessor":"end_date","name":"end_date","type":"Date"},{"accessor":"s_id","name":"s_id","type":"numeric"},{"accessor":"s_name","name":"s_name","type":"character"},{"accessor":"gender","name":"gender","type":"character"},{"accessor":"age","name":"age","type":"numeric"}],"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"dataKey":"413c1f3c101a174f7070712d78c69feb"},"children":[]},"class":"reactR_markup"},"evals":[],"jsHooks":[]}</script>

## Basic Formatting

With some additional tweaks, we can make it look better.

```r
reactable(
  data       = combined_df,
  compact    = TRUE, # for minimum row height
  filterable = TRUE, # for individual column filters
  striped    = TRUE, # banded rows
  resizable  = TRUE, # for resizable column widths
  columns    = list( # define custom header name, width, alignment etc.
    course_id   = colDef(name = "CID",         width = 50,  align = "center"),
    course_name = colDef(name = "Course Name", width = 140),
    start_date  = colDef(name = "Start Date",  width = 120, align = "center"),
    end_date    = colDef(name = "End Date",    width = 120, align = "center"),
    s_id        = colDef(name = "SID",         width = 70,  align = "center"),
    s_name      = colDef(name = "Student Name"),
    gender      = colDef(name = "Gender",      width = 80,  align = "center"),
    age         = colDef(name = "Age",         width = 50)
  )
)
```

<div id="htmlwidget-d308ea22dc0f64dbf7ed" class="reactable html-widget" style="width:auto;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-d308ea22dc0f64dbf7ed">{"x":{"tag":{"name":"Reactable","attribs":{"data":{"course_id":[1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4],"course_name":["Course A","Course A","Course A","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course C","Course C","Course C","Course C","Course D","Course D","Course D"],"start_date":["2021-01-01","2021-01-01","2021-01-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-03-01","2021-03-01","2021-03-01","2021-03-01","2021-04-01","2021-04-01","2021-04-01"],"end_date":["2021-01-31","2021-01-31","2021-01-31","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-03-31","2021-03-31","2021-03-31","2021-03-31","2021-04-30","2021-04-30","2021-04-30"],"s_id":[4,5,14,6,7,8,9,10,13,15,17,18,19,1,3,12,16,2,11,20],"s_name":["Student D","Student E","Student N","Student F","Student G","Student H","Student I","Student J","Student M","Student O","Student Q","Student R","Student S","Student A","Student C","Student L","Student P","Student B","Student K","Student T"],"gender":["X","Y","Y","Y","Y","X","Z","Z","Y","Y","Z","X","X","X","X","X","Z","X","X","Z"],"age":[22,19,21,25,20,18,27,28,21,35,22,21,19,21,30,25,30,22,32,35]},"columns":[{"accessor":"course_id","name":"CID","type":"numeric","width":50,"align":"center"},{"accessor":"course_name","name":"Course Name","type":"character","width":140},{"accessor":"start_date","name":"Start Date","type":"Date","width":120,"align":"center"},{"accessor":"end_date","name":"End Date","type":"Date","width":120,"align":"center"},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":80,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"striped":true,"compact":true,"dataKey":"37ac57f783425a81c3f289334adfb3a2"},"children":[]},"class":"reactR_markup"},"evals":[],"jsHooks":[]}</script>

However, the problem of repeating top-level fields still persists.

## Grouping and Aggregating

`{reactable}` has a **groupBy** argument which lets us combined rows with common data fields and the **aggregate** argument inside `colDef` lets us define what aggregation to be used for each column of the top-level data.

```r
reactable(
  data       = combined_df,
  compact    = TRUE, # for minimum row height
  filterable = TRUE, # for individual column filters
  striped    = TRUE, # banded rows
  resizable  = TRUE, # for resizable column widths
  groupBy    = "course_id",
  columns    = list(
    # show count of students in each course
    course_id   = colDef(name = "CID",         width = 100,  align = "left",    aggregate = "count"),  
    # show unique course name
    course_name = colDef(name = "Course Name", width = 140,                     aggregate = "unique"), 
    # show unique start date
    start_date  = colDef(name = "Start Date",  width = 120,  align = "center",  aggregate = "unique"), 
    # show unique end date
    end_date    = colDef(name = "End Date",    width = 120,  align = "center",  aggregate = "unique"), 
    s_id        = colDef(name = "SID",         width = 70,   align = "center"),
    s_name      = colDef(name = "Student Name"),
    gender      = colDef(name = "Gender",      width = 80,   align = "center"),
    age         = colDef(name = "Age",         width = 50)
  )
)
```

<div id="htmlwidget-44db758151977091446d" class="reactable html-widget" style="width:auto;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-44db758151977091446d">{"x":{"tag":{"name":"Reactable","attribs":{"data":{"course_id":[1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4],"course_name":["Course A","Course A","Course A","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course C","Course C","Course C","Course C","Course D","Course D","Course D"],"start_date":["2021-01-01","2021-01-01","2021-01-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-03-01","2021-03-01","2021-03-01","2021-03-01","2021-04-01","2021-04-01","2021-04-01"],"end_date":["2021-01-31","2021-01-31","2021-01-31","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-03-31","2021-03-31","2021-03-31","2021-03-31","2021-04-30","2021-04-30","2021-04-30"],"s_id":[4,5,14,6,7,8,9,10,13,15,17,18,19,1,3,12,16,2,11,20],"s_name":["Student D","Student E","Student N","Student F","Student G","Student H","Student I","Student J","Student M","Student O","Student Q","Student R","Student S","Student A","Student C","Student L","Student P","Student B","Student K","Student T"],"gender":["X","Y","Y","Y","Y","X","Z","Z","Y","Y","Z","X","X","X","X","X","Z","X","X","Z"],"age":[22,19,21,25,20,18,27,28,21,35,22,21,19,21,30,25,30,22,32,35]},"columns":[{"accessor":"course_id","name":"CID","type":"numeric","aggregate":"count","width":100,"align":"left"},{"accessor":"course_name","name":"Course Name","type":"character","aggregate":"unique","width":140},{"accessor":"start_date","name":"Start Date","type":"Date","aggregate":"unique","width":120,"align":"center"},{"accessor":"end_date","name":"End Date","type":"Date","aggregate":"unique","width":120,"align":"center"},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":80,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50}],"pivotBy":["course_id"],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"striped":true,"compact":true,"dataKey":"e9fc15f3a53a06ad3569f7b3f70a31cd"},"children":[]},"class":"reactR_markup"},"evals":[],"jsHooks":[]}</script>

In this case, all the columns which are not `aggregate`d remain hidden. Clicking the little triangle in the `CID` column displays the hidden rows. Looks better, but again, the issue of duplicated data remains.

You can aggregate the second-level columns too, but this distorts the table and frankly, looks ugly. Here I aggregate the `SID` column in addition to all the other top-level columns.

```r
reactable(
  data       = combined_df,
  compact    = TRUE, # for minimum row height
  filterable = TRUE, # for individual column filters
  striped    = TRUE, # banded rows
  resizable  = TRUE, # for resizable column widths
  groupBy    = "course_id",
  columns    = list(
    course_id   = colDef(name = "CID",         width = 100,  align = "left",    aggregate = "count"),
    course_name = colDef(name = "Course Name", width = 140,                     aggregate = "unique"),
    start_date  = colDef(name = "Start Date",  width = 120,  align = "center",  aggregate = "unique"),
    end_date    = colDef(name = "End Date",    width = 120,  align = "center",  aggregate = "unique"),
    # YIKES!! Aggregating Student ID to show unique ids in each course.
    s_id        = colDef(name = "SID",         width = 70,   align = "center",  aggregate = "unique"), 
    s_name      = colDef(name = "Student Name"),
    gender      = colDef(name = "Gender",      width = 80,   align = "center"),
    age         = colDef(name = "Age",         width = 50)
  )
)
```

<div id="htmlwidget-67b62794e33863e62991" class="reactable html-widget" style="width:auto;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-67b62794e33863e62991">{"x":{"tag":{"name":"Reactable","attribs":{"data":{"course_id":[1,1,1,2,2,2,2,2,2,2,2,2,2,3,3,3,3,4,4,4],"course_name":["Course A","Course A","Course A","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course B","Course C","Course C","Course C","Course C","Course D","Course D","Course D"],"start_date":["2021-01-01","2021-01-01","2021-01-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-02-01","2021-03-01","2021-03-01","2021-03-01","2021-03-01","2021-04-01","2021-04-01","2021-04-01"],"end_date":["2021-01-31","2021-01-31","2021-01-31","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-02-28","2021-03-31","2021-03-31","2021-03-31","2021-03-31","2021-04-30","2021-04-30","2021-04-30"],"s_id":[4,5,14,6,7,8,9,10,13,15,17,18,19,1,3,12,16,2,11,20],"s_name":["Student D","Student E","Student N","Student F","Student G","Student H","Student I","Student J","Student M","Student O","Student Q","Student R","Student S","Student A","Student C","Student L","Student P","Student B","Student K","Student T"],"gender":["X","Y","Y","Y","Y","X","Z","Z","Y","Y","Z","X","X","X","X","X","Z","X","X","Z"],"age":[22,19,21,25,20,18,27,28,21,35,22,21,19,21,30,25,30,22,32,35]},"columns":[{"accessor":"course_id","name":"CID","type":"numeric","aggregate":"count","width":100,"align":"left"},{"accessor":"course_name","name":"Course Name","type":"character","aggregate":"unique","width":140},{"accessor":"start_date","name":"Start Date","type":"Date","aggregate":"unique","width":120,"align":"center"},{"accessor":"end_date","name":"End Date","type":"Date","aggregate":"unique","width":120,"align":"center"},{"accessor":"s_id","name":"SID","type":"numeric","aggregate":"unique","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":80,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50}],"pivotBy":["course_id"],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"striped":true,"compact":true,"dataKey":"51a6dfecd993aea3dbb11e027155fa81"},"children":[]},"class":"reactR_markup"},"evals":[],"jsHooks":[]}</script>

Wouldn't it be nice if we could display only the top-level columns by default and on clicking the small triangle for a row, show all the second-level columns corresponding to that row only, like a drill-down table?

To do this we need 2 separate tables. Earlier in this post, I said it is advisable to split such denormalized data into normalized data i.e. create the original top-level and second level tables from the `combined_df`. Let's recreate the 2 tables.

I want to demonstrate how we go from the combined data to the 2 tables. Hence I will not use the `course` and `student` tables created earlier.

Creating the `top_level` table using just the columns in `course`. Let's also create a new column `n_students` depicting count of students in each course.

```r
top_level <- combined_df %>% 
  # Only course info columns
  count(course_id, course_name, start_date, end_date, name = "n_students") 

paged_table(top_level)
```

<div class="table-wrap data-table"><table>
<thead><tr><th style="text-align:right">course_id<span class="col-type">int</span></th><th style="text-align:left">course_name<span class="col-type">chr</span></th><th style="text-align:right">start_date<span class="col-type">date</span></th><th style="text-align:right">end_date<span class="col-type">date</span></th><th style="text-align:right">n_students<span class="col-type">int</span></th></tr></thead>
<tbody>
<tr><td style="text-align:right">1</td><td style="text-align:left">Course A</td><td style="text-align:right">2021-01-01</td><td style="text-align:right">2021-01-31</td><td style="text-align:right">3</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:left">Course B</td><td style="text-align:right">2021-02-01</td><td style="text-align:right">2021-02-28</td><td style="text-align:right">10</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:left">Course C</td><td style="text-align:right">2021-03-01</td><td style="text-align:right">2021-03-31</td><td style="text-align:right">4</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:left">Course D</td><td style="text-align:right">2021-04-01</td><td style="text-align:right">2021-04-30</td><td style="text-align:right">3</td></tr>
</tbody>
</table></div>

```r
second_level <- combined_df %>% 
  # Only Student info columns with unique identifier for Course
  select(course_id, s_id, s_name, gender, age) %>% 
  arrange(s_id)

paged_table(second_level)
```

<div class="table-wrap data-table"><table>
<thead><tr><th style="text-align:right">course_id<span class="col-type">int</span></th><th style="text-align:right">s_id<span class="col-type">int</span></th><th style="text-align:left">s_name<span class="col-type">chr</span></th><th style="text-align:left">gender<span class="col-type">chr</span></th><th style="text-align:right">age<span class="col-type">int</span></th></tr></thead>
<tbody>
<tr><td style="text-align:right">3</td><td style="text-align:right">1</td><td style="text-align:left">Student A</td><td style="text-align:left">X</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:right">2</td><td style="text-align:left">Student B</td><td style="text-align:left">X</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:right">3</td><td style="text-align:left">Student C</td><td style="text-align:left">X</td><td style="text-align:right">30</td></tr>
<tr><td style="text-align:right">1</td><td style="text-align:right">4</td><td style="text-align:left">Student D</td><td style="text-align:left">X</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">1</td><td style="text-align:right">5</td><td style="text-align:left">Student E</td><td style="text-align:left">Y</td><td style="text-align:right">19</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">6</td><td style="text-align:left">Student F</td><td style="text-align:left">Y</td><td style="text-align:right">25</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">7</td><td style="text-align:left">Student G</td><td style="text-align:left">Y</td><td style="text-align:right">20</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">8</td><td style="text-align:left">Student H</td><td style="text-align:left">X</td><td style="text-align:right">18</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">9</td><td style="text-align:left">Student I</td><td style="text-align:left">Z</td><td style="text-align:right">27</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">10</td><td style="text-align:left">Student J</td><td style="text-align:left">Z</td><td style="text-align:right">28</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:right">11</td><td style="text-align:left">Student K</td><td style="text-align:left">X</td><td style="text-align:right">32</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:right">12</td><td style="text-align:left">Student L</td><td style="text-align:left">X</td><td style="text-align:right">25</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">13</td><td style="text-align:left">Student M</td><td style="text-align:left">Y</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">1</td><td style="text-align:right">14</td><td style="text-align:left">Student N</td><td style="text-align:left">Y</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">15</td><td style="text-align:left">Student O</td><td style="text-align:left">Y</td><td style="text-align:right">35</td></tr>
<tr><td style="text-align:right">3</td><td style="text-align:right">16</td><td style="text-align:left">Student P</td><td style="text-align:left">Z</td><td style="text-align:right">30</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">17</td><td style="text-align:left">Student Q</td><td style="text-align:left">Z</td><td style="text-align:right">22</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">18</td><td style="text-align:left">Student R</td><td style="text-align:left">X</td><td style="text-align:right">21</td></tr>
<tr><td style="text-align:right">2</td><td style="text-align:right">19</td><td style="text-align:left">Student S</td><td style="text-align:left">X</td><td style="text-align:right">19</td></tr>
<tr><td style="text-align:right">4</td><td style="text-align:right">20</td><td style="text-align:left">Student T</td><td style="text-align:left">Z</td><td style="text-align:right">35</td></tr>
</tbody>
</table></div>

## The final Drill-down Table

Now that we have the 2 tables ready, let us now create the final `{reactable}`. The trick here is to use the **details** argument to which we pass another `{reactable}` of just the rows with students data corresponding to given course.

```r
reactable(
  data       = top_level,
  compact    = TRUE, # for minimum row height
  filterable = TRUE, # for individual column filters
  striped    = TRUE, # banded rows
  resizable  = TRUE, # for resizable column widths
  columns    = list(
    course_id   = colDef(name = "CID",             width = 50,  align = "center"),
    course_name = colDef(name = "Course Name"), 
    start_date  = colDef(name = "Start Date",      width = 120, align = "center"),
    end_date    = colDef(name = "End Date",        width = 120, align = "center"),
    n_students  = colDef(name = "No. of Students", width = 130, align = "center")
  ),
  details = function(index) { # index is the row number of current row.
    # sub-table of only those students for current row.
    sec_lvl = second_level[second_level$course_id == top_level$course_id[index], ] 
    reactable(data       = sec_lvl,
              compact    = TRUE, 
              filterable = TRUE,
              bordered   = TRUE, 
              resizable  = TRUE,
              columns    = list(
                course_id   = colDef(show = FALSE), # hide the course id column
                s_id        = colDef(name = "SID",    width = 70, align = "center"),
                s_name      = colDef(name = "Student Name"),
                gender      = colDef(name = "Gender", width = 90, align = "center"),
                age         = colDef(name = "Age",    width = 50, align = "center")
              )
              )
  }
)
```

<div id="htmlwidget-5a0cb435521fcff53b1c" class="reactable html-widget" style="width:auto;height:auto;"></div>
<script type="application/json" data-for="htmlwidget-5a0cb435521fcff53b1c">{"x":{"tag":{"name":"Reactable","attribs":{"data":{"course_id":[1,2,3,4],"course_name":["Course A","Course B","Course C","Course D"],"start_date":["2021-01-01","2021-02-01","2021-03-01","2021-04-01"],"end_date":["2021-01-31","2021-02-28","2021-03-31","2021-04-30"],"n_students":[3,10,4,3]},"columns":[{"accessor":".details","name":"","type":"NULL","sortable":false,"resizable":false,"filterable":false,"searchable":false,"width":45,"align":"center","details":[{"name":"Reactable","attribs":{"data":{"course_id":[1,1,1],"s_id":[4,5,14],"s_name":["Student D","Student E","Student N"],"gender":["X","Y","Y"],"age":[22,19,21]},"columns":[{"accessor":"course_id","name":"course_id","type":"numeric","show":false},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":90,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50,"align":"center"}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"bordered":true,"compact":true,"dataKey":"12036566002706ab50f66831a92eae32","nested":true},"children":[]},{"name":"Reactable","attribs":{"data":{"course_id":[2,2,2,2,2,2,2,2,2,2],"s_id":[6,7,8,9,10,13,15,17,18,19],"s_name":["Student F","Student G","Student H","Student I","Student J","Student M","Student O","Student Q","Student R","Student S"],"gender":["Y","Y","X","Z","Z","Y","Y","Z","X","X"],"age":[25,20,18,27,28,21,35,22,21,19]},"columns":[{"accessor":"course_id","name":"course_id","type":"numeric","show":false},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":90,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50,"align":"center"}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"bordered":true,"compact":true,"dataKey":"6587f2ad3dcb0fcc5216bf4473c986a0","nested":true},"children":[]},{"name":"Reactable","attribs":{"data":{"course_id":[3,3,3,3],"s_id":[1,3,12,16],"s_name":["Student A","Student C","Student L","Student P"],"gender":["X","X","X","Z"],"age":[21,30,25,30]},"columns":[{"accessor":"course_id","name":"course_id","type":"numeric","show":false},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":90,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50,"align":"center"}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"bordered":true,"compact":true,"dataKey":"e3963514a17cdadfff8af46fde214632","nested":true},"children":[]},{"name":"Reactable","attribs":{"data":{"course_id":[4,4,4],"s_id":[2,11,20],"s_name":["Student B","Student K","Student T"],"gender":["X","X","Z"],"age":[22,32,35]},"columns":[{"accessor":"course_id","name":"course_id","type":"numeric","show":false},{"accessor":"s_id","name":"SID","type":"numeric","width":70,"align":"center"},{"accessor":"s_name","name":"Student Name","type":"character"},{"accessor":"gender","name":"Gender","type":"character","width":90,"align":"center"},{"accessor":"age","name":"Age","type":"numeric","width":50,"align":"center"}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"bordered":true,"compact":true,"dataKey":"5a3a2a276df6d52409d68b95331871bb","nested":true},"children":[]}]},{"accessor":"course_id","name":"CID","type":"numeric","width":50,"align":"center"},{"accessor":"course_name","name":"Course Name","type":"character"},{"accessor":"start_date","name":"Start Date","type":"Date","width":120,"align":"center"},{"accessor":"end_date","name":"End Date","type":"Date","width":120,"align":"center"},{"accessor":"n_students","name":"No. of Students","type":"numeric","width":130,"align":"center"}],"resizable":true,"filterable":true,"defaultPageSize":10,"paginationType":"numbers","showPageInfo":true,"minRows":1,"striped":true,"compact":true,"dataKey":"4234130aace77d06280744fa5876f205"},"children":[]},"class":"reactR_markup"},"evals":[],"jsHooks":[]}</script>

Since the sub-table is also a `{reactable}`, you can go another level down... and another, but please do consider the usability aspect of this feature before taking that decision. I haven't tried going beyond 2 levels of data myself. Maybe a part 2 to this post??

## Conclusion

Drill-down tables let you pack a lot of data in a compact manner and allow use by multiple audiences interested in varying degrees/levels of information. `{reactable}` can help create an interactive data table from tabular data with sorting and pagination by default. The data table is an HTML widget that can be used in R Markdown documents and Shiny applications, or viewed from an R console. A lot of features can be enabled/disabled using the basic arguments of the `reactable()` function and much more using custom JavaScript.

## References & Citations

-   Greg Lin (2020). reactable: Interactive Data Tables Based on 'React Table'. R package version 0.2.3. https://CRAN.R-project.org/package=reactable
