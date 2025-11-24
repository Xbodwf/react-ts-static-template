import type { Plugin } from "vite"

import { parse } from "node-html-parser"

const needBasePathArr = ["src", "data-src", "href"]

/**
 * Combines path segments like C#'s Path.Combine
 * Handles leading/trailing slashes properly
 */
function combinePath(...segments: string[]): string {
  if (segments.length === 0) return ""

  // Filter out empty segments
  const validSegments = segments.filter((s) => s && s.length > 0)
  if (validSegments.length === 0) return ""

  // Process each segment
  const processedSegments = validSegments.map((segment, index) => {
    let processed = segment

    // Remove leading slash from all segments except the first one
    if (index > 0 && processed.startsWith("/")) {
      processed = processed.substring(1)
    }

    // Remove trailing slash from all segments except the last one
    if (index < validSegments.length - 1 && processed.endsWith("/")) {
      processed = processed.substring(0, processed.length - 1)
    }

    return processed
  })

  return processedSegments.join("/")
}

/**
 * @returns
 */
function htmlPostBuildPlugin(base?: string): Plugin {
  return {
    name: "html-post-build",
    enforce: "post",
    apply: "build",
    transformIndexHtml(html) {
      const root = parse(html)

      while (root.querySelector('script[type="module"]')) {
        const moduleScript = root.querySelector('script[type="module"]')
        moduleScript?.remove()
      }

      const prereloadScript = root.querySelector('link[rel="modulepreload"]')
      prereloadScript && prereloadScript.remove()
      const nomoduleScripts = root.querySelectorAll("script[nomodule]")
      for (const i in nomoduleScripts) {
        nomoduleScripts[i].removeAttribute("nomodule")
        nomoduleScripts[i].removeAttribute("crossorigin")
        if (base) {
          needBasePathArr.forEach((attrName) => {
            if (nomoduleScripts[i].hasAttribute(attrName)) {
              const value = nomoduleScripts[i].getAttribute(attrName)
              if (value && !value.startsWith("http") && !value.startsWith(base)) {
                const formattedValue = combinePath(base, value)
                nomoduleScripts[i].setAttribute(attrName, formattedValue)
              }
            }
          })
        }
      }

      const crossoriginLinks = root.querySelectorAll("link[crossorigin]")
      for (const i in crossoriginLinks) {
        crossoriginLinks[i].removeAttribute("nomodule")
        crossoriginLinks[i].removeAttribute("crossorigin")
        if (base) {
          needBasePathArr.forEach((attrName) => {
            if (crossoriginLinks[i].hasAttribute(attrName)) {
              const value = crossoriginLinks[i].getAttribute(attrName)
              if (value && !value.startsWith("http") && !value.startsWith(base)) {
                const formattedValue = combinePath(base, value)
                crossoriginLinks[i].setAttribute(attrName, formattedValue)
              }
            }
          })
        }
      }

      const allLinks = root.querySelectorAll("link[href]")
      for (const i in allLinks) {
        if (base && allLinks[i].hasAttribute("href")) {
          const value = allLinks[i].getAttribute("href")
          if (
            value &&
            !value.startsWith("http") &&
            !value.startsWith(base) &&
            !allLinks[i].hasAttribute("crossorigin")
          ) {
            const formattedValue = combinePath(base, value)
            allLinks[i].setAttribute("href", formattedValue)
          }
        }
      }

      return root.innerHTML
    },
  }
}

export default htmlPostBuildPlugin
