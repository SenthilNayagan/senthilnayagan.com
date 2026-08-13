---
title: 'Async Awesomeness: A Deep Dive into Rust’s Asynchronous Capabilities'
description: >-
  With async capabilities, developers can write non-blocking code that handles
  multiple operations simultaneously without the complexity of traditional
  multithreading. Async programming is ideal for I/O-bound tasks, offering a
  more responsive and scalable solution for modern applications. Let's dive into
  the world of Rust’s asynchronous capabilities and discover how to build
  high-performance, efficient software.
keywords:
  - asynchronous
  - asynchronous-programming
tags:
  - asynchronous
  - asynchronous-programming
coverImage: ./images/cover-image.jpg
imageCredits: AI-generated image from freepik.
featured: true
---

Let’s face it, most "developers are creatures of habit." When it comes to I/O-bound intensive tasks, many stick to their trusty old blocking-based programming. It’s like ordering the same coffee every day, even though you know there’s a whole menu of exciting options out there. The focus is usually on getting the expected outcome – who cares if the program takes a scenic route through CPU wasteland to get there?

But what if I told you that switching to asynchronous programming is like discovering a secret espresso shot that supercharges your app’s performance? In this post, we’re going to shake things up and dive into the wild world of Rust’s async capabilities. Buckle up, because it’s time to break the blocking habit and unlock the true potential of your I/O-bound tasks!

{% include "toc.md" %}

# What is asynchronous programming? 

Asynchronous programming is a form of *concurrency programming model* that allows multiple tasks to run independently in a *non-blocking manner* without waiting for each other.

This promotes: 

- **Efficient utilization of resources** - System resources are utilized to their fullest potential, leading to better performance, scalability, and responsiveness in modern applications
- **Efficient management of I/O operations** that often involve waiting for external events. 
- **Improved responsiveness**, especially in scenarios where tasks involve waiting for I/O operations, such as reading from or writing to a file, handling user input, etc.

**Synchronous programming**, aka **sequential programming**, is more widely adopted, mature, and "standardized" than concurrent programming. In traditional synchronous programming, when a program encounters an I/O operation (such as reading from a file or interacting with a database), it typically blocks and waits for the operation to complete before moving on to the next instruction. During this blocking period, the entire program may remain idle, potentially leading to insufficient utilization of resources.

Asynchronous programming, on the other hand, allows the program to continue executing other tasks while running tasks in the background, especially I/O operations. Upon completion of the background-running task, the program is notified, and the appropriate callback or continuation is executed. Asynchronous programming enables our program to start a potentially long-running task and still be responsive to other events while that task runs, rather than having to wait until that task has finished.

The asynchronous programming model is typically more complicated for the developer but results in a faster runtime for I/O-heavy workloads. Asynchronous programming pertains to situations where the execution order is not predetermined. External events, often related to I/O, impact the sequence of execution. Examples include a device driver signaling that it is ready.

## Async vs. pure parallelism

Async and parallelism are related concepts within the domain of concurrent programming, but they address different aspects of handling tasks concurrently.

### Async programming

**Async programming** allows tasks to proceed independently without waiting for the completion of others. It is particularly useful for handling I/O-bound operations where a program can efficiently utilize its time while waiting for data. Async programming does not necessarily imply parallelism. Tasks are designed to overlap in time, but they may not execute simultaneously on multiple processors. The objective is to prevent idle time by allowing the program to continue with other tasks while waiting for certain operations to be completed.

### Parallelism

Parallelism, on the other hand, involves the simultaneous execution of multiple tasks on multiple processors or CPU cores. The objective is to improve overall performance by dividing a larger task into smaller subtasks that can be executed concurrently "at the same time". Parallelism aims to achieve true simultaneous execution. It is commonly used in CPU-bound tasks where computations can be divided to be processed concurrently at the same time.

While async programming and parallelism are distinct concepts, they can be combined in certain scenarios. For example, a system might use asynchronous programming to handle I/O-bound tasks efficiently and parallelism to process CPU-bound tasks concurrently. Async programming is more focused on task coordination and efficient use of resources, while parallelism is geared toward maximizing computational throughput by leveraging multiple processors or CPU cores.

> ***Threads are for working in parallel and async is for waiting in parallel.*** - Quote from the internet.

## A glossary of terms relating to concurrency

### Various concurrency models

Let's understand some of the most popular concurrency models that can help us understand how asynchronous programming fits within the wider field of concurrent programming. The creation of a thread involves allocating resources such as a stack and a program counter, and the kernel manages the scheduling of threads on available CPU cores.

#### Operating System (OS) threads

- OS threads play a crucial role in implementing concurrency. 
- **Thread creation and management:** 
  - OS threads are managed by the operating system kernel. 
  - The creation of an OS thread involves allocating resources such as a stack and a program counter
- **Implementation**
  - Implementing concurrency with OS threads is a straightforward process, as it does not require any changes to the programming model.
- **Parallelism**
  - OS threads can enable parallelism by allowing multiple threads to execute in parallel on different CPU cores.
- **Synchronization**
  - Synchronization mechanisms, such as **locks**, **semaphores**<a href="#ref-1" class="reference-link" data-ref="ref-1"><sup id="back-to-1">1</sup></a>, and **condition variables**, are often used with OS threads to coordinate access to shared resources and avoid race conditions.
- **Resource overhead** 
  - Each thread has its own stack, program counter, and other resources, and managing a large number of threads can lead to increased memory usage and context-switching overhead.
  - However, **thread pools**<a href="#ref-2" class="reference-link" data-ref="ref-2"><sup id="back-to-2">2</sup></a> can mitigate some of these costs, but not enough to support massive IO-bound workloads.

#### Event-driven programming

- Event-driven programming, in conjunction with callbacks, can be very performant but tends to result in complex and non-linear asynchronous control flow.
- Data flow and error propagation is often hard to follow.

#### Coroutines

- Coroutines, like threads, don't require changes to the programming model, which makes them easy to use. Like async, they can also support a large number of tasks. 
- However, they abstract away low-level details that are important for systems programming and custom runtime implementors.

#### Actor model

- The actor model divides all concurrent computation into units called actors, which communicate through message passing, much like in distributed systems. 
- The actor model can be efficiently implemented, but it leaves many practical issues unanswered, such as flow control and retry logic.

### Context switching

Context switching is the process of switching the CPU (or virtual processor) from one thread to another. It is an essential component of multithreading, enabling the operating system to concurrently execute multiple tasks. When a thread is running, the operating system keeps track of its state, including its *program counter*, *stack*, and *registers*. When the operating system needs to switch to another thread, it saves the state of the current thread and subsequently restores the state of the new or other thread.

**Context switching can incur significant costs** as it forces the operating system to save and restore the thread's state. However, it is an indispensable evil needed for multitasking.

The frequency of context switches can be influenced by various factors, such as the number of active threads, the nature of the work performed by those threads, and the scheduling algorithm that the operating system is using. In general, the more threads that are running, the more often context switches will occur.

# Asynchronous programming in Rust

Developing a fast and reactive application requires the use of asynchronous programming. Rust's implementation of async differs from most languages in certain ways, which include:

- **Futures are inactive in Rust**
  - A future does not start executing its associated code until an executor or a runtime actively polls it. 
  - Dropping a future typically means that the associated computation is canceled or cleaned up, and it implies that the future will no longer make progress or complete its task.
- **Async is zero-cost in Rust**
  - It emphasizes that using asynchronous programming constructs should not impose any runtime overhead.
  - Specifically, we can use async without heap allocations and dynamic dispatch, which is great for performance and this also lets us use async in constrained environments, such as embedded systems.
- **No built-in async runtime**
  - No built-in async runtime is provided by Rust.
  - Instead, runtimes (<a href="https://tokio.rs/" target="_blank">Tokio</a>, etc.) are provided by community maintained crates.
- **Both single- and multithreaded runtimes** are available in Rust, which have different strengths and weaknesses.

## Async vs. threads in Rust

The primary alternative to async in Rust is using OS threads, either directly through `std::thread` or indirectly through a thread pool.

**OS threads** are suitable for a small number of tasks, since threads come with CPU and memory overhead. Spawning and switching between threads is quite expensive as even idle threads consume system resources. A thread pool library can help mitigate some of these costs, but not all. Threads let you reuse existing synchronous code without significant code changes. It is also possible to modify the priority of a thread in certain operating systems, which is beneficial for drivers and other applications that are sensitive to latency.

**Async** provides significantly reduced CPU and memory overhead, especially for workloads with a large amount of IO-bound tasks. **Asynchronous programming is not superior than threads, but different**. When performance does not require asynchronous operations, threads are frequently a more straightforward alternative.

## Language and external library support for async programming in Rust

Although Rust itself provides support for asynchronous programming, the majority of async applications rely on the functionality offered by community crates. Therefore, a combination of language features and library support is required:

- The `Future` trait (`std::future::Future`) is a fundamental part of the asynchronous programming model *offered by the standard library in Rust*. Usually, we don't have to interact with `Future` directly too often, but it serves as a fundamental component of the entire model. The `poll` method allows checking whether the future has completed, is still pending, or encountered an error.

    ```rust {data-copyable=true}
    pub trait Future {
        type Output;

        // Required method
        fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
    }
    ```

- The `async` keyword is supported directly by the Rust compiler.
- The `.await` syntax is also supported directly by the Rust compiler.
- Many utility types, macros and functions are provided by the `futures` crate and they can be used in any async Rust application.
- Execution of async code, IO and task spawning are provided by **async runtimes**, such as **Tokio** and **async-std**. Most async applications, and some async crates, depend on a specific runtime.

## Asynchronous code and synchronous code

It is not always possible to combine synchronous and asynchronous code freely. For example, we can't directly call an async function from a sync function. Even asynchronous code cannot always be freely combined. Certain packages require a particular async runtime in order to operate. If so, it is usually specified in the crate's dependency list. It is crucial to investigate potential crates and async runtimes in advance, as these compatibility issues may restrict your options. Once we have settled in with a runtime, we won't have to worry much about compatibility.

## async/.await keyword

`async/.await` is Rust's built-in tool or keywords for writing asynchronous functions that look like synchronous code.

### async Keyword

- The `async` keyword is used to define asynchronous functions.
- An async function returns a `Future`, which represents a computation or value that may not have been completed yet but will be available later in time.
- Asynchronous functions are defined using the `async fn` syntax.
  
    ```rust {data-copyable=true}
    // It's syntactic sugar
    async fn async_function() -> u32 { 
      /* Asynchronous code here */ 
      50
    }

    // Desyntactic sugar
    fn async_function() -> impl Future<Output = u32> { 
      /* Asynchronous code here */ 
      async(50)
    }
    ```

  The value returned by `async fn` is a `Future`. 

- Under the hood, `async` transforms a block of code into a **state machine**<a href="#ref-3" class="reference-link" data-ref="ref-3"><sup id="back-to-3">3</sup></a> that implements a trait called `Future`.
    
  Dependencies to be added to the `Cargo.toml` file:

    ```toml {data-copyable=true}
    [dependencies]
    futures = "0.3"
    ```

### .await Keyword

- The `await` keyword is used within an asynchronous function to suspend its execution until the result of a `Future` is ready.
- The `await` keyword can only be used inside functions marked as `async`.
- `await` returns control to the executor so that it may proceed. The executor (3rd party) might run the task to completion.
- The `await` syntax allows us to describe the "cooperative scheduling" of tasks.


    ```rust {data-copyable=true}
    async fn example() -> i32 {
        let result = example_async_function().await;
        // Further code that executes after the awaited Future completes
        result + 10
    }
    ```

For any action to take place, the `Future` needs to be run on an executor.

{% aside %} **futures::executor::block_on vs .await()**: TODO: https://rust-lang.github.io/async-book/01_getting_started/04_async_await_primer.html#asyncawait-primer {% endaside %}

## future crate

The `futures` crate in Rust is a foundational library for working with asynchronous programming. The `futures` crate defines the `Future` trait, which is a fundamental building block for asynchronous programming. The `futures` crate is often used in conjunction with the `async/.await` syntax. Asynchronous functions using the `async/await` syntax return types that implement the `Future` trait, and the `futures` crate provides utilities to work with these async functions. It provides a variety of *combinators* and *utility functions*, allowing developers to *chain*, *map*, and *compose* asynchronous operations. 

Also, this crate introduces abstractions for working with **streams** (sequences of values over time) and **sinks** (consumers of values). The `futures` crate is designed to be executor-agnostic. It doesn't prescribe a specific runtime or executor, allowing developers to use it with various asynchronous runtimes, such as **Tokio**, **async-std**, or others.

## Future trait

A `Future` is an *asynchronous computation* that produce a *value* or an *error* at *some point in the future*. The `Future` trait might look something like this:

```rust {data-copyable=true}
pub trait Future {
    type Output;

    // Required method
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

The `poll` method is where the actual work of an asynchronous operation is done, and it determines the current state and progress of the future. In other words, the `poll` method allows checking whether the future has completed, is still pending, or encountered an error. The `poll` method is called repeatedly until the final value is available.

The `Self::Output` is the associated type of a `poll` method indicating the type of value that the future will produce upon completion. If the future completes, it returns `Poll::Ready(result)`. If the future is not able to complete yet, it returns `Poll::Pending` and arranges for the `wake()` function to be called when the `Future` is ready to make more progress. With `wake()`, the executor knows exactly which futures are ready to be polled.

Now the question arises: **who constantly calls the poll method repeatedly until the final value is available?** One possible approach is to manually invoke the `poll` method from our synchronous application multiple times to obtain the final value. I understand what you are thinking. Not to worry. We won't be doing that kind of manual polling. We will hand over this polling task to **runtime**. Note that asynchronous Rust code does not run on its own, so we must choose a runtime to execute it.

Having said that, before we can make use of the async syntax, a runtime must be present. Async runtimes are libraries used for executing async applications. Note that there is no asynchronous runtime in the Rust's standard library. The following is a list of widely known community-provided async runtime crates:

- <a href="https://tokio.rs/" target="_blank">Tokio</a>: A popular async ecosystem with HTTP, gRPC, and tracing frameworks.
- <a href="https://docs.rs/async-std/" target="_blank">async-std</a>: A crate that provides asynchronous counterparts to standard library components.

## Runtime's role in asynchronous programming

As of the writing of this post, the Tokio library is the most widely used runtime. Let's use Tokio runtime.

Tokio is an *asynchronous runtime* for the Rust programming language. The need for an asynchronous runtime in Rust arises from the desire to: 

- Scheduling and managing the execution of asynchronous tasks efficiently. It includes an executor, a task scheduler, and various utilities.
- Handling I/O operations concurrently
- Providing a multi-threaded runtime for the execution of asynchronous code

When writing asynchronous code, we cannot use the ordinary blocking APIs provided by the Rust standard library, and must instead use asynchronous versions of them. These alternate versions are provided by Tokio, mirroring the API of the Rust standard library where it makes sense.

## Async programming with Tokio

**Tokio** is a resilient Rust asynchronous runtime. The fundamental building block of Tokio is its asynchronous task scheduling and execution model. Tokio's event loop efficiently manages task scheduling and ensures optimal utilization of CPU cores and minimizes context-switching overhead.

We can: 

- Wait for multiple tasks to complete with `join`
- Select the first completed task with `select` 
- Race tasks against each other with `race`

First thing first: Add the Tokio crate to our `Cargo.toml` file's dependencies section:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

Choose the appropriate version of Tokio. The `features = ["full"]` ensures that we get the full set of features provided by Tokio.

Here’s how we can use the async/await syntax in our Rust programs with Tokio:

```rust {data-copyable=true}
use tokio::time::sleep;
use std::time::Duration;

#[tokio::main]  // Annotate main function to make it async
async fn main() { 
    hello_world().await;
}

async fn hello_world() {
    println!("Hello, ");
    sleep(Duration::from_secs(1)).await;
    println!("World!");
}
```

In the above code, `hello_world` is an asynchronous function, as it prefixes `async`. We use the `await` keyword to pause its execution until the future is resolved or completed. The `hello_world` function prints "`Hello,` " immediately to the console. The invocation of the `Duration::from_secs(1)` function pauses its execution for one second. The `await` keyword waits for the sleep future to complete. Finally, the `hello_world` function prints "`World!`" to the console.

The `main` function is an function (technically, not an async function) with the `#[tokio::main]` attribute. The `#[tokio::main]` attribute specifies the entry point of an asynchronous Rust program that runs on the Tokio runtime. Under the hood, the `#[tokio::main]` attribute transforms the regular main function into an async-aware function, allowing it to use asynchronous code, including async/await syntax.

```rust {data-copyable=true}
// Syntactic sugar version
#[tokio::main]
async fn main() { 
    hello_world().await;
}


// Desugar version
fn main() -> Results<()> {
	let body = async { /* some async code */ };

	{
		return tokio::runtime::Builder::new_multi_thread()
			.enable_all()
			.build()
			.expect("Failed building the Runtime")
			.block_on(body);
	}
}
```

### Components of Tokio

- **Executor** maintains a state about what resources it's waiting on.
- **Reactor** interacts with operating system (via crate Mio) to say "Wake me up if any of these file descriptors change state." It also handles waiting on non-OS events, such as receiving on a channel.

### Error handling in async programs

Error handling in asynchronous code involves using the `Result` type and handling errors with the `?` operator.

```rust {data-copyable=true}
async fn process_file() -> io::Result<()> {
    let contents = read_file_contents().await?;  // assume read_file_contents() reads file
    // Process the file contents
    Ok(())
}

#[tokio::main]
async fn main() {
    match process_file().await {
        Ok(()) => println!("File processed successfully."),
        Err(err) => eprintln!("Error processing file: {}", err),
    }
}
```

The `process_file` function returns an `io::Result` that represents the possibility of an I/O error. By using the `?` operator after the asynchronous operation, the Tokio runtime will propagate errors into the call stack. The `main` function handles the result with a `match` statement.

---

# Frequently asked questions (FAQs)

## What is the difference between concurrency and parallelism, and how do the two differ from asynchronous programming?

**Concurrency** refers to the ability of multiple tasks to be executed independently, making progress in an _overlapping time period_ but not necessarily simultaneously. It's important to be noted that concurrency is about managing multiple tasks and making progress on each task, but _not necessarily at the same time_, meaning, _tasks are not running simultaneously or in parallel_.  One of the tasks can begin before the preceding or previous one is completed; however, both of these tasks won’t be running at the same time. A single processor is used for running the tasks in the concurrency model.

Under the hood, a CPU can work on only one task at a time. If it is assigned multiple tasks, it simply switches between these tasks. Since this switching is so fast and seamless, it gives us a sense that these tasks are running in parallel. However, they are not parallel. Concurrency pretends that we have multiple cores, or CPUs.

The main objective of concurrency is to maximize the CPU by minimizing its idle time. Put simply, **concurrency is about doing multiple things, not at once**.

**Parallelism** is the ability to execute independent tasks of a program _simultaneously_ (at the same moment in time). Parallelism takes advantage of multi-core processors. Tasks can run "simultaneously" across multiple cores. Note that parallism is only possible with multiple cores or CPUs. Put simply, **parallelism is about doing multiple things at once**.

**Asynchronous programming** is a language feature that enables concurrency and/or parallelism. As it turns out, asynchronous programming is entirely unrelated to concurrency and parallelism.

## What is cooperative and preemptive multitasking?

**Cooperative multitasking**: Each task in cooperative multitasking decides when it can be handed over to another.

**Preemptive multitasking**: As opposed to cooperative multitasking, the system decides when to switch to other tasks.

## How does a kernel-level thread differ from a user-level thread?

**Kernel-level threads**, aka native threads, are managed by the operating system kernel. The operating system is responsible for scheduling and context switching. It's heavier than user-level threads in terms of overhead. It's better suited for scenarios requiring parallelism and direct interaction with system services. 

**Disadvantages**

- Relatively limited number we can create!

**User-level threads**, also known as lightweight threads or green threads, are managed entirely by a user-level thread library or runtime. The operating system kernel is unaware of these threads. It's lightweight and have lower overhead compared to kernel-level threads. Scheduling and context switching are performed by the user-level thread library or runtime. It's efficient for scenarios where a large number of threads need to be managed. Since it's lighter weight, we can create many more green threads.

**Disadvantages**

- Stack growth can cause issues!

## What is the difference between `.await` and `block_on`?

The `.await` passed the wait along. It doesn't block; it just propagates the wait, allowing us to continue with other tasks.

The `block_on` on the other hand, is different because it doesn't propagate the wait. It just block until the future is finished. It doesn't return to the caller of the future. It doesn't allow us to do other things, it waits until the future has finished.

<div class="references">
  <hr>
  <h2>References</h2>
  <ol>
  <!-- <li>Nil</li> -->
    <li id="ref-1">1. A <strong>semaphore</strong> is a <em>synchronization primitive</em> to control access to a shared resource or a <strong>critical section</strong> of code. Semaphores help prevent race conditions. There are two types of semaphores: <strong>binary semaphores</strong> and <strong>counting semaphores</strong>. A counting semaphore is initialized with a non-negative integer value, which represents the number of available resources. Based on this number, resources will be allocated to threads. <a href="#back-to-1" class="back-to-note">↩</a>
    </li>
    <li id="ref-2">2. A <strong>thread pool</strong> is a collection of pre-created threads (ready-to-use threads) that can be reused to execute tasks. A thread pool reduces the resource consumption associated with creating and destroying threads repeatedly for short-lived tasks. Instead of creating a new thread for each task, threads from the pool are assigned to tasks as needed. This reuse helps reduce the overhead associated with thread creation and destruction. <a href="#back-to-2" class="back-to-note">↩</a>
    </li>
    <li id="ref-3">3. A <strong>state machine</strong> is a mechanism used to represent the various <em>states</em> and <em>transitions</em> of a future as it progresses through its lifecycle. The <code>Future</code> trait defines an asynchronous computation that produces a result at some point in the future. <code>Future</code>s in Rust are often implemented as state machines, which manage asynchronous computations by utilizing the state machine pattern. <a href="#back-to-3" class="back-to-note">↩</a>
    </li>
  </ol>
</div>
