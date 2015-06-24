(ns golf-test.core-test
  (:require [clojure.test :refer :all]
            [clj-webdriver.taxi :refer :all]))



(defn browser-fixture [test-fn]
      ;; Start up a browser
      (set-driver! {:browser :chrome})
      (implicit-wait 500)

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
                  (is (exists? {:tag :option :text "10:32"})))
         (testing "has add button"
                  (to site-url)
                  (is (exists? {:tag :button :text "Move Me To"})))
         (testing "has cancel button")
                  (to site-url)
                  (is (exists? {:tag :button :text "Cancel My Time"})))

(deftest time-table-rendered
         (testing "correct number of entries"
                  (to site-url)
                  (is (= 3 (count (find-elements {:css ".tee-time"}))))
                  (testing "correct number of players in each time"
                           (to site-url)
                           (is (= 5 (count (find-elements {:css ".player"})))))))

(deftest moving-to-new-flight
         (testing "Move to new flight"
                  (to site-url)
                  (select-option {:tag :select} {:text "10:32"})
                  (click {:tag :button :text "Move Me To"})
                  (is (= (text {:css "table:nth-of-type(3) tbody tr:nth-of-type(2) td"}) "Harry"))))

(deftest cancel-time
         (testing "can cancel")
         (to site-url)
         (click {:tag :button :text "Cancel My Time"})
         (is (not= (text {:css "table:first-of-type tbody tr:first-of-type td"}) "Harry")))

(deftest take-time
         (testing "Move to new flight"
                  (to site-url)
                  (select-option {:tag :select} {:text "10:32"})
                  (click {:tag :button :text "Cancel My Time"})
                  (click {:tag :button :text "Add Me At"})
                  (is (= (text {:css "table:nth-of-type(3) tbody tr:nth-of-type(2) td"}) "Harry"))))


