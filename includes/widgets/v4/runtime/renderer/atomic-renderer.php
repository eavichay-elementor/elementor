<?php

namespace Elementor\V4\Runtime\Renderer;

use Elementor\Core\Utils\Registry;

class Atomic_Renderer {

    private $_widget_class_name;

    public function __construct(string $widget_class_name)
    {
        $this->_widget_class_name = $widget_class_name;
    }

    public function twig(string $template) {
        Registry::instance('elementor/widget-twig')->set($this->_widget_class_name, $template);
        return $this;
    }

    public function js(string $js) {
        Registry::instance('elementor/widget-js')->set($this->_widget_class_name, $js);
        return $this;
    }

    public function css(string $css) {
        Registry::instance('elementor/widget-css')->set($this->_widget_class_name, $css);
        return $this;
    }
}