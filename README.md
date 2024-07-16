# ZodOrm

<p align="center">
<a href="https://github.com/ryancircelli/zodorm/actions"><img src="https://github.com/ryancircelli/zodorm/actions/workflows/npm-publish.yaml/badge.svg" alt="ZodOrm CI status" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/ryancircelli/zodorm" alt="License"></a>
<a href="https://www.npmjs.com/package/@ryancircelli/zodorm" rel="nofollow"><img src="https://img.shields.io/npm/dw/%40ryancircelli%2Fzodorm" alt="npm"></a>
<a href="https://www.npmjs.com/package/@ryancircelli/zodorm" rel="nofollow"><img src="https://img.shields.io/github/stars/ryancircelli/zodorm" alt="stars"></a>
</p>

ZodOrm is a powerful and flexible ORM solution for NoSQL databases, specifically designed to work seamlessly with TypeScript and Zod. It provides robust type generation, schema validation, and integration with infrastructure management tools like Terraform.

## Features

### Table Definitions

Define your database tables with ease using ZodOrm. It supports:

- **Primary Key, Sort Key:** Define primary and sort keys for efficient data retrieval.
- **Global Secondary Index (GSI):** Add GSIs to optimize query performance and add more flexibility to your data models.

### Type Generation

Automatically generate TypeScript types from your schema definitions to ensure type safety across your application.

- **Table Name Enums:** Enumerations for table names to avoid hardcoding strings and reduce errors.
- **GSI Name Enums:** Enumerations for GSI names to ensure consistency.
- **Table Key Types:** Types for table keys (primary and sort keys) for better type checking.
- **GSI Key Types:** Types for GSI keys to maintain type safety in your queries.

### Zod Schema Exposure

Expose your table schemas as Zod schemas for validation and parsing.

- Requires default values for missing fields. Useful for ZodObject parsing from an unreliable soruce (the NoSQL table)!

- **Table Zod Schema Exposure:** Use the Zod schemas directly in your application for runtime type validation and data parsing.

### Watch Changes

Automatically watch your schema files for changes and regenerate types as needed.

- **Watch the Schema for Changes:** Set up watchers on your schema files to detect changes and regenerate TypeScript types on the fly.

### Schema Exporting

Easily export your schemas for use with other tools and processes.

- **Terraform Integration:** Export your schemas for seamless integration with Terraform. Use the provided Terraform module to deploy your tables effortlessly.
  - **Use the Exported Schema:** Generate Terraform configurations from your schema definitions.
  - **Provided Terraform Module:** Deploy your tables with minimal configuration using the pre-built Terraform module.

## Todo

- CI
  - Export to own repo
  - Publish to npm
- Usage Docs
- Tests
