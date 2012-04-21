(ns onewayticket.web
  (:require [clojure.xml :as xml])
  (:use [compojure.core])
  (:use [hiccup.page :only [html5 include-css include-js]])
  (:use [hiccup.element :only [javascript-tag]])
  (:require [compojure.route :as route]
            [compojure.handler :as handler])
  (:use [ring.adapter.jetty :only [run-jetty]]))

(defn- inkscape-layer? [element]
  (and (= (element :tag) :g)
       (let [attrs (element :attrs)]
         (= (attrs :inkscape:groupmode) "layer"))))

(defn- load-file [name]
  (let [ldr (.getContextClassLoader (Thread/currentThread))
        is (.getResourceAsStream ldr (str "public/" name))]
    is))

(defn- inkscape-layer? [element]
  (and (= (element :tag) :g)
       (let [attrs (element :attrs)]
         (= (attrs :inkscape:groupmode) "layer"))))

(defn- inkscape-attribute? [key]
  (let [k (name key)]
    (or (re-matches #"inkscape:.*" k)
        (re-matches #"sodipodi:.*" k)
        (re-matches #"cc:.*" k)
        (re-matches #"dc:.*" k))))

(defn- unstyled-object? [object]
  (some (hash-set (get-in object [:attrs :inkscape:label])) ["button" "displaymode" "space"]))

(defn- cleaned-attribute? [object key]
  (or (inkscape-attribute? key)
      (let [k (name key)]
        (and (unstyled-object? object)
             (re-matches #"style" k)))))

(defn- cleanup [object]
  (cond (nil? object) nil
        (string? object) object
        :else (let [attrs (:attrs object)
                    content (:content object)]
                (assoc object
                  :attrs (when attrs
                           (select-keys attrs
                                        (remove (partial cleaned-attribute? object)
                                                (keys attrs))))
                  :content (when content
                             (remove nil? (map cleanup content)))))))


(defn inline-svg [filename]
  (let [filename (str "svg/" filename)
        xml (xml/parse (load-file filename))
        content (filter inkscape-layer? (xml :content))
        defs (first (xml :content))
        content (map cleanup content)]
    content
    (with-out-str (xml/emit {:tag :svg
                             :attrs {:xmlns:svg "http://www.w3.org/2000/svg"
                                     :xmlns "http://www.w3.org/2000/svg"
                                     :width "1920"
                                     :height "1080"
                                     :version "1.1"
                                     :style "border: 1px solid black"}
                             :content (concat [defs] content)}))))

(defn intro [state]
  (html5 [:head [:title "One-way Ticket To Space Train"]
          (include-css "css/main.css")
          (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js")
          (include-js "js/main.js")]
         [:body
          (inline-svg "ui.svg")
          [:div {:id "intro" :class "introtext"}]
          (javascript-tag (str "init(" (:fast state) ");"))]))

(defn init-game-state [& {:keys [fast] :as state}]
  state)

(defn start-game [fast]
  (intro (init-game-state :fast (= "true" fast))))

(defroutes main-routes
  (GET "/"  {{state :state} :session
             {fast :fast} :params}
       (start-game fast))
  (route/resources "/")
  (route/not-found "Page not found!"))

(def app (handler/site main-routes))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))