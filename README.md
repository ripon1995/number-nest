```text
number-nest/
├── .gitignore
├── associated-docs/
│   ├── db-diagram/
│   │   └── number-nest-db-diagram.pdf
│   ├── functional-requirement.txt
│   ├── helper-docs/
│   │   └── git-helper-commands.txt
│   └── sequence-diagrams/
│       ├── user-login.txt
│       └── user-registration.txt
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── course/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── db/
│   │   └── mongo.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── user/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── authentication.py
│   │   ├── migrations/
│   │   │   └── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   └── utils/
│       ├── __init__.py
│       ├── error_response.py
│       ├── success_response.py
│       └── view_wrapper.py
├── docker-compose.yaml
├── frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── CourseCard.css
│   │   │   ├── CourseCard.tsx
│   │   │   ├── Dashboard.css
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Homepage.css
│   │   │   ├── Homepage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Logo.css
│   │   │   ├── Logo.tsx
│   │   │   ├── Registration.css
│   │   │   └── Registration.tsx
│   │   ├── constants/
│   │   │   └── endpoints.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── store/
│   │   │   ├── useCourseStore.ts
│   │   │   └── useUserStore.ts
│   │   ├── types/
│   │   │   ├── course.ts
│   │   │   └── user.ts
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── README.md
