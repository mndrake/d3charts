library(d3charts)

df <- read.csv('demo/jobs_simple.csv')

bubblemap(df, height = 600, width = 1000)
