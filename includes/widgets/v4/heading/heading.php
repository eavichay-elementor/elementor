<?php

namespace Elementor\V4\Heading;

function run($ctx)
{
    $builder = $ctx->widget_builder('V4 Heading');
    $builder->set('template', 'heading.html.twig');
    $builder->set('css', 'heading.css');
    $builder->set('script', 'heading.js');
    $builder->set_property('title', [
        'label' => 'Title',
        'section' => 'Content',
        'type' => 'text_area',
        'default' => 'Add your title here',
        'placeholder' => 'Enter your title',
    ]);
    $builder->set_property('tag', [
        'name' => 'tag',
        'label' => 'Tag',
        'type' => 'select',
        'default' => 'h2',
        'options' => [
            [
                'label' => 'H1',
                'value' => 'h1',
            ],
            [
                'label' => 'H2',
                'value' => 'h2',
            ],
            [
                'label' => 'H3',
                'value' => 'h3',
            ],
            [
                'label' => 'H4',
                'value' => 'h4',
            ],
            [
                'label' => 'H5',
                'value' => 'h5',
            ],
            [
                'label' => 'H6',
                'value' => 'h6',
            ],
        ],
    ]);

    $builder->set_property('link', [
        'label' => 'Link',
        'section' => 'Content',
        'type' => 'link',
        'meta' => [
            'topDivider' => true,
        ],
    ]);
    // $builder->set_property('keywords', [
    //     'label' => 'Keywords',
    //     'section' => 'Extra',
    //     'type' => 'array',
    //     'default' => [],
    //     'array_type' => 'text',
    // ]);
    $builder->build();
}



add_action('elementor/widgets/register-atoms', '\Elementor\V4\Heading\run');
