
# ERD Tool

A modern, full-featured Entity-Relationship Diagram (ERD) tool built with Next.js and TypeScript. This application allows users to visually design, manage, and export ER diagrams with advanced features, AI-powered suggestions, and robust authentication.

---

## 🚀 Features

- **Visual ERD Editor**: Drag-and-drop interface for creating and editing entities, attributes, and relationships.
- **Entity & Attribute Management**: Add, edit, and delete entities and their attributes with custom types and constraints.
- **Relationship (Edge) Management**: Define and visualize relationships between entities.
- **Undo/Redo & Recovery**: Easily undo/redo changes and recover deleted diagrams.
- **AI-Powered Suggestions**: Get AI-generated suggestions for diagram improvements and attribute recommendations using [AI SDK](https://ai-sdk.dev/docs/introduction) and Openai ChatGPT 4.1 Mini.
- **Authentication**: Secure user authentication with registration, login, and confirmation flows. Supporting authenticated users as well as Guest users. Thanks to AWS Cognito.
- **Export Options**: Export diagrams to various formats (e.g., SQL for MySQL, PostgreSQL, SQL Server, TypeScript). You can copy DDL SQL commands for SQL databases or get TypeScript interfaces for your entities. In addition, you can generate data for your ERD.
- **Sidebar & Search**: Quickly navigate and search through diagrams.
- **Feedback System**: Users can submit feedback directly from the app.
- **Themes**: Switch between system, light and dark themes.
- **Responsive Design**: Fully responsive UI for different devices, with custom support for touch screens.

---

## 🛠️ Technologies Used

- **Frontend**:
  - [Next.js](https://nextjs.org/) (App Router)
  - [React](https://react.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [React Flow](https://reactflow.dev/) (for diagram rendering)
  - [Zustand](https://zustand-demo.pmnd.rs/) (for global state management)
  - [Tanstack Query](https://tanstack.com/query/latest) (for data fetching and create/update/delete data)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Lightning CSS](https://lightningcss.dev/)
  - [React Syntax Highlighter](https://www.npmjs.com/package/react-syntax-highlighter) (for code export syntax highlighting)
  - [Cytoscape.js](https://js.cytoscape.org/) (for positioning suggestion nodes)
- **AI Integration**:
  - [AI SDK](https://ai-sdk.dev/docs/introduction) (for AI-powered suggestions and full diagram generation)
- **Backend**:
  - [Node.js](https://nodejs.org/)
  - [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
  - [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/)
  - [DynamoDB](https://aws.amazon.com/dynamodb/)
  - [Cognito](https://aws.amazon.com/cognito/)
  - [Lambda](https://aws.amazon.com/lambda/)
  - [API Gateway](https://aws.amazon.com/api-gateway/)
  - [Cloud Watch](https://aws.amazon.com/cloudwatch/)
  - [SES](https://aws.amazon.com/ses/)
  - I have another repo for the backend part: [erd-tool-be](https://github.com/amine01993/erd-tool-be)

---

## 📦 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Run the development server:**
   ```sh
   npm run dev
   ```

3. **Open in browser:**
   Visit http://localhost:3000

4. **Demo Website:**
   Visit https://erd-tool.vercel.app/

## 📝 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgements

Inspired by modern ERD tools, database design best practices and [dbdiagram](https://dbdiagram.io/home).<br>
Built with ❤️ by [amine01993](https://github.com/amine01993).

