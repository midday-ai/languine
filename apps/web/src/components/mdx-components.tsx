import type { MDXComponents } from "mdx/types";
import Image, { type ImageProps } from "next/image";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: function H1({ className = "", children, ...props }) {
      return (
        <h1
          className={`scroll-m-20 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 ${className}`}
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: function H2({ className = "", children, ...props }) {
      return (
        <h2
          className={`scroll-m-20 pb-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 first:mt-0 ${className}`}
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: function H3({ className = "", children, ...props }) {
      return (
        <h3
          className={`scroll-m-20 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 ${className}`}
          {...props}
        >
          {children}
        </h3>
      );
    },
    h4: function H4({ className = "", children, ...props }) {
      return (
        <h4
          className={`scroll-m-20 text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 ${className}`}
          {...props}
        >
          {children}
        </h4>
      );
    },
    p: function P({ className = "", children, ...props }) {
      return (
        <p
          className={`leading-7 text-secondary text-sm [&:not(:first-child)]:mt-6 ${className}`}
          {...props}
        >
          {children}
        </p>
      );
    },
    ul: function UL({ className = "", children, ...props }) {
      return (
        <ul
          className={`my-6 ml-6 list-disc text-gray-700 dark:text-gray-300 [&>li]:mt-2 ${className}`}
          {...props}
        >
          {children}
        </ul>
      );
    },
    ol: function OL({ className = "", children, ...props }) {
      return (
        <ol
          className={`my-6 ml-6 list-decimal text-gray-700 dark:text-gray-300 [&>li]:mt-2 ${className}`}
          {...props}
        >
          {children}
        </ol>
      );
    },
    li: function LI({ className = "", children, ...props }) {
      return (
        <li
          className={`leading-7 text-gray-700 dark:text-gray-300 ${className}`}
          {...props}
        >
          {children}
        </li>
      );
    },
    blockquote: function Blockquote({ className = "", children, ...props }) {
      return (
        <blockquote
          className={`mt-6 border-l-2 border-gray-300 pl-6 italic text-gray-800 dark:text-gray-200 ${className}`}
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    a: function A({ className = "", children, ...props }) {
      return (
        <a
          className={`font-medium text-primary underline underline-offset-4 hover:text-primary/80 ${className}`}
          {...props}
        >
          {children}
        </a>
      );
    },
    img: function Img(props) {
      return (
        <Image
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          className="rounded-lg"
          {...(props as ImageProps)}
        />
      );
    },
    ...components,
  };
}
