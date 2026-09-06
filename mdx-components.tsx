import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mb-4 text-white dark:text-white">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mb-3 text-white dark:text-white">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mb-2 text-white dark:text-white">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-white dark:text-white">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 text-white dark:text-white">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 text-white dark:text-white">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-1 text-white dark:text-white">{children}</li>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 text-white dark:text-white">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
        {children}
      </pre>
    ),
    ...components,
  }
}