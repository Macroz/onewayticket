(ns onewayticket.web
  (:use [compojure.core])
  (:use [hiccup.page :only [html5 include-css include-js]])
  (:use [hiccup.element :only [javascript-tag]])
  (:require [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [ring.adapter.jetty :only [run-jetty]]))

(defn intro []
  (html5 [:head [:title "One-way Ticket To Space Train"]]
         [:body "Space man, it's huge!"]))

(defroutes main-routes
  (GET "/" [] (intro))
  (route/resources "/")
  (route/not-found "Page not found!"))

(def app (handler/site main-routes))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))