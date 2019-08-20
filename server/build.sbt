scalaVersion := "2.12.7"

name := "server"

organization := "org.felher"

scalacOptions ++= Seq(
  "-deprecation",                      // Emit warning and location for usages of deprecated APIs.
  "-encoding", "utf-8",                // Specify character encoding used by source files.
  "-explaintypes",                     // Explain type errors in more detail.
  "-feature",                          // Emit warning and location for usages of features that should be imported explicitly.
  "-language:existentials",            // Existential types (besides wildcard types) can be written and inferred
  "-language:experimental.macros",     // Allow macro definition (besides implementation and application)
  "-language:higherKinds",             // Allow higher-kinded types
  "-language:implicitConversions",     // Allow definition of implicit functions called views
  "-unchecked",                        // Enable additional warnings where generated code depends on assumptions.
  "-Xcheckinit",                       // Wrap field accessors to throw an exception on uninitialized access.
  "-Xfatal-warnings",                  // Fail the compilation if there are any warnings.
  "-Xfuture",                          // Turn on future language features.
  "-Xlint:adapted-args",               // Warn if an argument list is modified to match the receiver.
  "-Xlint:by-name-right-associative",  // By-name parameter of right associative operator.
  "-Xlint:constant",                   // Evaluation of a constant arithmetic expression results in an error.
  "-Xlint:delayedinit-select",         // Selecting member of DelayedInit.
  "-Xlint:doc-detached",               // A Scaladoc comment appears to be detached from its element.
  "-Xlint:inaccessible",               // Warn about inaccessible types in method signatures.
  "-Xlint:infer-any",                  // Warn when a type argument is inferred to be `Any`.
  "-Xlint:missing-interpolator",       // A string literal appears to be missing an interpolator id.
  "-Xlint:nullary-override",           // Warn when non-nullary `def f()' overrides nullary `def f'.
  "-Xlint:nullary-unit",               // Warn when nullary methods return Unit.
  "-Xlint:option-implicit",            // Option.apply used implicit view.
  "-Xlint:package-object-classes",     // Class or object defined in package object.
  "-Xlint:poly-implicit-overload",     // Parameterized overloaded implicit methods are not visible as view bounds.
  "-Xlint:private-shadow",             // A private field (or class parameter) shadows a superclass field.
  "-Xlint:stars-align",                // Pattern sequence wildcard must align with sequence component.
  "-Xlint:type-parameter-shadow",      // A local type parameter shadows a type already in scope.
  "-Xlint:unsound-match",              // Pattern match may not be typesafe.
  "-Yno-adapted-args",                 // Do not adapt an argument list (either by inserting () or creating a tuple) to match the receiver.
  "-Ypartial-unification",             // Enable partial unification in type constructor inference
  "-Ywarn-dead-code",                  // Warn when dead code is identified.
  "-Ywarn-extra-implicit",             // Warn when more than one implicit parameter section is defined.
  "-Ywarn-inaccessible",               // Warn about inaccessible types in method signatures.
  "-Ywarn-infer-any",                  // Warn when a type argument is inferred to be `Any`.
  "-Ywarn-nullary-override",           // Warn when non-nullary `def f()' overrides nullary `def f'.
  "-Ywarn-nullary-unit",               // Warn when nullary methods return Unit.
  "-Ywarn-numeric-widen",              // Warn when numerics are widened.
  "-Ywarn-unused:implicits",           // Warn if an implicit parameter is unused.
  "-Ywarn-unused:imports",             // Warn if an import selector is not referenced.
  "-Ywarn-unused:locals",              // Warn if a local definition is unused.
  "-Ywarn-unused:params",              // Warn if a value parameter is unused.
  "-Ywarn-unused:patvars",             // Warn if a variable bound in a pattern is unused.
  "-Ywarn-unused:privates",            // Warn if a private member is unused.
  "-Ywarn-value-discard"               // Warn when non-Unit expression results are unused.
)

scalacOptions ++= Seq(
  "-Ybackend-parallelism", "8"
)

wartremoverErrors ++= Seq(Wart.StringPlusAny, Wart.custom("de.uniwue.scala.warts.StringInterpolation"))

wartremoverClasspaths ++= {
  (dependencyClasspath in Compile).value.files.find(_.name.contains("morewarts")).map(_.toURI.toString).toList
}

scalacOptions in (Compile, console) --= Seq("-Ywarn-unused:imports", "-Xfatal-warnings")

resolvers += Resolver.sonatypeRepo("releases")
resolvers += "Uni-Artifactory" at "http://artifactory-ls6.informatik.uni-wuerzburg.de/artifactory/libs-release"
addCompilerPlugin("org.spire-math" %% "kind-projector" % "0.9.8")

libraryDependencies ++= Seq(
  "org.typelevel"   %% "cats-core"           % "1.4.0",
  "org.typelevel"   %% "cats-effect"         % "1.0.0",
  "io.circe"        %% "circe-core"          % "0.10.1",
  "io.circe"        %% "circe-generic"       % "0.10.1",
  "io.circe"        %% "circe-parser"        % "0.10.1",
  "org.http4s"      %% "http4s-blaze-server" % "0.20.0-M3",
  "org.http4s"      %% "http4s-circe"        % "0.20.0-M3",
  "org.http4s"      %% "http4s-dsl"          % "0.20.0-M3",
  "ch.qos.logback"   % "logback-classic"     % "1.2.3",
  "de.uniwue.scala" %% "morewarts"           % "0.1",
  "org.docx4j"       % "docx4j"              % "6.0.1",
  "javax.xml.bind"   % "jaxb-api"            % "2.3.0",
)

assemblyMergeStrategy in assembly := {
 case PathList("META-INF", xs @ _*) => MergeStrategy.discard
 case x => MergeStrategy.first
}
