(ns golf-test.core-test
  (:require [clojure.test :refer :all]
            [clj-webdriver.taxi :refer :all]))



(defn browser-fixture [test-fn]
      ;; Start up a browser
      (set-driver! {:browser :chrome})

      (def site-url "http://localhost:3000")
      ;; do the testing
      (test-fn)

      ;; shut down browser
      (close))

(use-fixtures :once browser-fixture)


(deftest connect-to-site
  (testing "Connect to web driver and retrieve basic info"
           (to  site-url)
           (is (exists? {:tag :h1 :text "Tee Time Registration"}))))

(deftest headers
         (testing "time input exists"
                  (to site-url)
                  (is (exists? {:tag :label :text "Time"})))
         (testing "has add button"
                  (to site-url)
                  (is (exists? {:text "Add Me"}))))

(deftest time-table-rendered
         (testing "correct number of entries"
                  (to site-url)
                  (is (= 3 (count (find-elements {:css ".tee-time"}))))
                  (testing "correct number of players in each time"
                           (to site-url)
                           (is (= 6 (count (find-elements {:css ".player"})))))))


