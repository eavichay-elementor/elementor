<?php

namespace Elementor\V4\Widgets;

class Chart_Factory {

    public static function define($ctx) {
        $ctx->title('V4 Chart')
            ->name('v4-chart')
            ->atomic();
    }

    public static function define_properties($ctx) {
        $ctx->property('dataset')
            ->label('Dataset, comma seperated numbers')
            ->kind('text_area')
            ->default('1,2,3,4,5');

        $ctx->property('chart_type')
            ->label('Chart Type')
            ->kind('select')
            ->options([
                'Line' => 'line',
                'Bar' => 'bar',
                'Column' => 'column',
                'Area' => 'area',
                'Pie' => 'pie',
                'Polar' => 'polar'
            ]);
    }

    public static function define_renderer($ctx) {
        $ctx
            ->twig(__DIR__ . '/chart.html.twig')
            ->js(__DIR__ . '/chart.js')
            ->css(__DIR__ . '/chart.css');
    }

}

add_action('elementor/widgets/define', function($ctx) {
    $ctx->register(Chart_Factory::class);
});