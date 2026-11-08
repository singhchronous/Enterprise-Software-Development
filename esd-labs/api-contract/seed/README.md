# Loading the seed into your backend

`seed.json` is what every conforming backend starts with:

- 3 users — `admin@esd.local` / `admin12345` (ADMIN), `student@esd.local` / `student12345`
  and `riya@esd.local` / `riya12345` (STUDENTs). Passwords are in plain text **in this file
  only**; store their hashes, like any other password.
- 20 courses, in five departments, one of them `Data Science & AI`.
- 5 enrollments: riya fills the five courses with capacity 1 that are full
  (CS201, EC210, MA202, DS220, HS205). `seatsLeft` is never stored — it is capacity minus
  enrollments.

## Get it onto the classpath

Copy `seed.json` into your project's `src/main/resources/`. Then
`new ClassPathResource("seed.json")` finds it, from your IDE and from the jar.

## Load it once, at startup

Spring Boot runs every `ApplicationRunner` (or `CommandLineRunner`) bean once the app has
started. Write one that reads the file with Jackson and saves through your repositories.

**It must be idempotent.** With MySQL the data survives a restart, so a runner that always
inserts would add the seed again on every start: duplicate users, or a crash on a unique
constraint. The simplest rule: **seed only an empty database.**

A skeleton to adapt — the names (`UserRepository`, your entity constructors, `SeedData`)
are yours to fill in:

```java
@Component
public class SeedLoader implements ApplicationRunner {

    // inject: ObjectMapper, your repositories, PasswordEncoder (constructor injection)

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (userRepository.count() > 0) {
            return;                      // already seeded (or real data): never seed twice
        }
        SeedData seed;
        try (InputStream in = new ClassPathResource("seed.json").getInputStream()) {
            seed = objectMapper.readValue(in, SeedData.class);
        }
        // 1. save each user — with passwordEncoder.encode(password), never the plain text
        // 2. save each course
        // 3. save each enrollment: look its user up by email and its course by code
    }
}
```

`SeedData` can be a record that mirrors the JSON (`users`, `courses`, `enrollments`, each a
list of small records). Put `@JsonIgnoreProperties(ignoreUnknown = true)` on it so the
`_comment` field doesn't trip Jackson.

## Check it

Restart your backend twice, then run `npm run conformance -- --level A`. Check A04 (the 20
courses, exactly as seeded) and A05 (the five full courses) pass, and that you still have
20 courses, not 40.

With H2 in memory, every start is a fresh database, so the seed always loads. With MySQL,
to start over, drop the database (or its tables) and restart.
