(ns onewayticket.web
  (:use [compojure.core])
  (:use [hiccup.page :only [html5 include-css include-js]])
  (:use [hiccup.element :only [javascript-tag]])
  (:require [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [ring.adapter.jetty :only [run-jetty]]))

(defn intro []
  (html5 [:head [:title "One-way Ticket To Space Train"]
          (include-css "css/main.css")
          (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js")
          (include-js "js/main.js")]
         [:body [:div {:id "intro" :class "introtext"} "Space man, it's huge!"]]))

(defroutes main-routes
  (GET "/" [] (intro))
  (route/resources "/")
  (route/not-found "Page not found!"))

(def app (handler/site main-routes))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))