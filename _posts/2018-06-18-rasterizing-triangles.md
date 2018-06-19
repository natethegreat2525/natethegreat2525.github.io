---
layout: post
title: "Software Renderer Tutorial - Rasterizing Triangles"
date: 2018-06-18
---

Now that we can draw pixels to the screen, the next step is to fill in a triangle on the screen. This is called rasterizing. To rasterize triangles we are going to fill in all of the pixels that are "inside" the triangle. So how do we determine what points are inside the triangle efficiently? There are plenty of algorithms that can be found online to test if a point is in a polygon but these are too slow. We need to minimize the code that runs for each pixel since this code will be run the most. We will be doing some basic vector math for this section so I have provided the base of a Point3 class below. The only functions that may need explaining are the dot2 and cross2 functions which are the dot product and cross product of only the 2d part of the 3d vector. Why we are using 3d vectors (and soon 4d vectors) for drawing to a 2d screen will become clear later but for now we can just ignore the z axis. We will add more functions and math classes as needed.

To import the math class and use it in main, add the following lines:

### import math.js ###

### math.js module ###

Let's define our inputs to help define the problem more clearly. We want to write a function that takes some sort of buffer object, 3 points, and a color and fills in the triangle on the buffer. For now we also want to only render triangles going a certain direction. We can use clockwise triangles. This seems like an arbitrary decision, but it will save us time later when we want to only show the outside faces of triangles to minimize the number of pixels we are rendering. The 3 points can be in any clockwise order so the first thing we will do is swap points around to ensure that p1 is the highest point, p1-p2 is the right segment of the triangle, and p1-p3 is the left side of the triangle.

The following code rotates the vertices so that p1 has the highest y value

### Insert code for vertex swapping ###

To ensure that p2 is on the right, we will simply throw out any triangles that are not counter clockwise. The cross product of the 2d vectors that run along the edges of the triangle can help us do this. The cross product has a lot of use in geometry and graphics but for this case the main property we care about is that if the second vector is rotated clockwise from the first vector, it will return a positive z value, otherwise the z value will be negative. The cross2 function I have implemented only returns the z value because the x and y values of the cross product of two 2d vectors will always be zero. If we take the cross product of p1-p2 and p1-p3 and it is positive, then we continue, otherwise, we can simply return.

### Insert cross product code ###

Our triangle points are in order and we can imagine them looking something like this:

### Insert labeled triangle ###

To draw this triangle we will now move a scan line down the triangle and draw a line of pixels between the left and right edge of the triangle for each scan line. There are now two cases to consider. The scan line starts out expanding slowly until it reaches the second lowest point on the triangle. Then it switches back to shrinking until it hits the lowest point.

### Insert illustration of scan line growing and shrinking ###

As a result, we will make a function that can draw half of the triangle at a time. We will call it "doHalfTri". This function needs to know the top starting points, the slopes of the lines coming out of those points, and the scan line start height and scan line end height. Then we just need to call this function once for the top half and once for the bottom half of the triangle.

### Illustration of doHalfTri function ###

A simple for loop can draw each row of pixels if we can provide the left and right boundaries for each scan line. To calculate the lower boundary of the top scan line, we can put p2 and slope2 into point slope form and solve for the intersection with the scan line.

### Insert point slope equation and solution ###

To get the equation for p1 and slope1 we can simply swap them out with p2 and slope2 so there is no need to derive the equation again. Now we have a formula we can use to get the lower and upper bound for the scan line so we should be able to write that inner for loop that draws each pixel. We only want to draw pixels inside the triangle so we will take the ceiling of the two values and use a for loop to iterate from the lower value inclusive to the upper value exclusive. The upper value should not be drawn because its coordinates are outside of our triangle bounds.

### illustration of lower and upper bound and which pixels to draw on a scan line ###

### insert code for drawing half triangle ###

The code above has one major difference from what we described so far. On each scan line, instead of recalculating the lower and upper bounds, it just adds the inverse slope of each bound. We can do this because as the scan line increases by 1, the result of the equation increases by the corresponding inverse slope. This is the main reason we pass in the inverse of the slope rather than the slope itself.

## Putting it all together ##

We have all of the pieces to render a triangle. Now we just need to put them together. Our top half triangle can be drawn by passing the p1 vector in as both the left and right start point. We then need to pass in the inverse slope of p1-p2 for the right side of the triangle and the inverse slope of p1-p3 for the right side of the triangle. Our scan start would simply be the top of the triangle which is the ceiling of p1.y. Our scan stop (which is exclusive) should be the ceiling of the middle point's y value. This could be p2 or p3 since only p1 is guaranteed to be at the top.

### Insert code to draw top half ###

Now there are two cases to deal with. Either p2 is the middle point or p3 is the middle point. If p2 is the middle point then we start with p1 and p2 as the lower and upper vertices, using their slopes to p3 as the slope. If p3 is the middle point then we start with p3 and p1 as the lower and upper vertices also passing in their slopes to p2. This will draw the bottom half of our triangle.

### bottom half code ###

To test your code it is best to draw triangles in many orientations so I have made a quick main loop to draw rotating triangles and give our function a test.

### rotating triangle code ###

### full triangle drawn demo ###

Congratulations on rasterizing your first triangle! Unfortunately the triangles look a bit boring as they are all solid colors with no gradients or texture. We will fix this in the next section by adding fragment shaders that allow you to define how each pixel of a triangle looks in a simple callback function.
