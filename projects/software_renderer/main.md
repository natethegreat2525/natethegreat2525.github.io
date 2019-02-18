---
title: Software Renderer Tutorial
layout: page
---

# Software Renderer From Scratch

![Final Demo](/assets/software_renderer/specular_highlight.gif)

## The Idea

This is an overview of a fun project I decided to turn into a tutorial. In this tutorial I will go over everything necessary to make a fully functioning software renderer with a rendering pipeline very similar to that provided by OpenGL including vertex and fragment shaders. The tutorial is in Javascript but only uses minimal functionality specific to the language and could be done in any language. The code snippets provided are designed to provide a fully functioning final product even if you only copy paste each section while skimming the tutorial.

When I started working with OpenGL I had no idea what was going on behind the scenes. As I used it more and learned more about shaders, I developed a mental model for how I **thought** everything was working behind the scenes. This project challenged that belief and I learned a lot more nuance and aspects of software rendering that I had not considered before. Perspective corrected interpolation, fragments vs pixels, and clipping planes were just a few examples of unanticipated learning challenges along the way.

## The Functionality

The final product is a close to real-time software renderer that has its own basic shader pipeline that allows for many complex shaders used for modern visual effects. Due to its similarity to GLSL it is relatively trivial to convert a shader to work with the software renderer. To demonstrate this, the final demo uses multipass rendering and a simplified phong shader to make realistic looking shadows, shading, and specular highlights. Texturing with different interpolation algorithms as well as normal mapping are possible as well.

### <a href="/projects/software_renderer/part1/">Part 1 - Getting Started >></a>
### <a href="/projects/software_renderer/part2/">Part 2 - Rasterizing Triangles >></a>
### <a href="/projects/software_renderer/part3/">Part 3 - Fragment Shaders >></a>
### <a href="/projects/software_renderer/part4/">Part 4 - Vertex Shaders >></a>
### <a href="/projects/software_renderer/part5/">Part 5 - Perspective >></a>
### <a href="/projects/software_renderer/part6/">Part 6 - Depth >></a>
### <a href="/projects/software_renderer/part7/">Part 7 - Clipping >></a>
### <a href="/projects/software_renderer/part8/">Part 8 - Textures >></a>
<br/>
### <a href="https://www.github.com/natethegreat2525/softwarerenderer">View the original Github Project >></a>
