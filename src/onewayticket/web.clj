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
  (some (hash-set (get-in object [:attrs :inkscape:label])) ["button" "displaymode" "space" "system" "planet" "module" "area"]))

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
                                     :width "100%"
                                     :height "100%"
                                     :viewBox "0 0 1920 1080"
                                     :preserveAspectRatio "xMidYMax slice"
                                     :version "1.1"
                                     :style "border: 1px solid black"}
                             :content (concat [defs] content)}))))

(defn intro [state]
  (html5 [:head [:title "One-way Ticket To Space Train"]
          (include-css "css/main.css")
          (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js")
          (include-js "js/main.js")]
         [:body {:style "overflow: hidden;"}
          (inline-svg "ui.svg")
          [:div {:id "intro" :class "introtext"}]
          (javascript-tag (str "init(" (:fast state) ");"))]))

(defn init-game-state [& {:keys [fast] :as state}]
  state)

(defn start-game [fast]
  (intro (init-game-state :fast (= "true" fast))))

(defn sound-link [l]
  [:a {:href l} l])

(defn screenshot [name]
  [:a {:href (str "/images/" name ".png")}
   [:img {:src (str "/images/" name "s.png")}]])

(defn menu []
  (html5 [:head [:title "One-way Ticket To Space Train"]
          (include-css "css/main.css")
          (include-js "http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js")
          (include-js "js/main.js")]
         [:body
          [:div {:class "menu"}
           [:h1 "One-way Ticket To Space Train"]
           [:h3 "Game entry to " [:a {:href "http://www.ludumdare.com/"} "Ludum Dare #23"]]
           [:h3 "By Markku Rontu / markku.rontu@iki.fi / @zorcam"]
           [:h5 "(except sounds from Freesound artists)"
            [:ul
             [:li (sound-link "http://www.freesound.org/people/junggle/sounds/29304/")]
             [:li (sound-link "http://www.freesound.org/people/Robinhood76/sounds/67032/")]
             [:li (sound-link "http://www.freesound.org/people/ERH/sounds/29594/")]
             [:li (sound-link "http://www.freesound.org/people/ERH/sounds/30192/")]]]
           [:h3 [:a {:href "/game"} "Start"]]
           [:h3 [:a {:href "/game?fast=true"} "Start (skip intro)"]]
           [:h3 "Screenshots"]
           [:table [:tr
                    [:td (screenshot "screenshot1")]
                    [:td (screenshot "screenshot2")]
                    [:td (screenshot "screenshot3")]]]
           [:h3 "Post-mortem"]
           [:p "This was my first Ludum Dare and it was fun making the game. Most fun is working with the game logic and story. So I think I will go on for a bit to finish out all the ideas I had. But that's after the competition. This is where I got this time."]
           [:p "I think I implemented around 10% of all my ideas. There was simply no time for them all. I didn't waste much time and managed to focus well. On Saturday I used 12 hours on this and on Sunday about 8."]
           [:p "Next time I will make a tiny game, not a story driven / adventure game. Or just keep making games for fun without limits. The time limit focused doing, but it does lead to hacking."]
           [:p "I ended up mainly programming in JavaScript, though the server part is Clojure. All graphics are SVG manipulated with the JavaScript and Clojure together. I would like to clean up that code and maybe release some libraries."]
           ]]))


(defroutes main-routes
  (GET "/" [] (menu))
  (GET "/game"  {{state :state} :session
                 {fast :fast} :params}
       (start-game fast))
  (route/resources "/")
  (route/not-found "Page not found!"))

(def app (handler/site main-routes))

(defn -main [port]
  (run-jetty app {:port (Integer. port)}))