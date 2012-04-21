(defproject onewayticket "1.0.0-SNAPSHOT"
  :description "One-way Ticket To Space Train, Ludum Dare #23 game programming competition entry by @zorcam"
  :dependencies [[org.clojure/clojure "1.2.1"]
                 [org.clojure/clojure-contrib "1.2.0"]
                 [compojure "1.0.1"]
                 [hiccup "1.0.0-RC2"]
                 [ring/ring-jetty-adapter "1.1.0-RC1"]]
  :dev-dependencies [[swank-clojure "1.2.1"]
                     [lein-ring "0.4.5"]
                     [ring-serve "0.1.2"]]
  :ring {:handler onewayticket.web/app})