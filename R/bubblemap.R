#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
bubblemap <- function(data, width = 960, height = 600) {

  # forward options using x
  x = list(
    data = data
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'bubblemap',
    x,
    width = width,
    height = height,
    package = 'd3charts'
  )
}

#' Widget output function for use in Shiny
#'
#' @export
bubblemapOutput <- function(outputId, width = '100%', height = '600px'){
  shinyWidgetOutput(outputId, 'bubblemap', width, height, package = 'd3charts')
}

#' Widget render function for use in Shiny
#'
#' @export
renderBubblemap <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  shinyRenderWidget(expr, bubblemapOutput, env, quoted = TRUE)
}
