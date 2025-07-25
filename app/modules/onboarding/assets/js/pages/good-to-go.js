import Grid from 'elementor-app/ui/grid/grid';
import Layout from '../components/layout/layout';
import Card from '../components/card';
import FooterButtons from '../components/layout/footer-buttons';

export default function GoodToGo() {
	const pageId = 'goodToGo',
		skipButton = {
			text: __( 'Skip', 'elementor' ),
			href: elementorAppConfig.onboarding.urls.createNewPage,
		},
		kitLibraryLink = elementorAppConfig.onboarding.urls.kitLibrary + '&referrer=onboarding';

	return (
		<Layout pageId={ pageId }>
			<h1 className="e-onboarding__page-content-section-title">
				{ elementorAppConfig.onboarding.experiment
					? __( 'Welcome aboard! What\'s next?', 'elementor' )
					: __( 'That\'s a wrap! What\'s next?', 'elementor' ) }
			</h1>
			<div className="e-onboarding__page-content-section-text">
				{ __( 'There are three ways to get started with Elementor:', 'elementor' ) }
			</div>
			<Grid container alignItems="center" justify="space-between" className="e-onboarding__cards-grid e-onboarding__page-content">
				<Card
					name="blank"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Blank_Canvas.svg' }
					imageAlt={ __( 'Click here to create a new page and open it in Elementor Editor', 'elementor' ) }
					text={ __( 'Edit a blank canvas with the Elementor Editor', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.createNewPage }
				/>
				<Card
					name="template"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Library.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Website Templates', 'elementor' ) }
					text={ __( 'Choose a professionally-designed template or import your own', 'elementor' ) }
					link={ kitLibraryLink }
					clickAction={ () => {
						// The location is reloaded to make sure the Kit Library's state is re-created.
						location.href = kitLibraryLink;
						location.reload();
					} }
				/>
				<Card
					name="site-planner"
					image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Site_Planner.svg' }
					imageAlt={ __( 'Click here to go to Elementor\'s Site Planner', 'elementor' ) }
					text={ __( 'Create a professional site in minutes using AI', 'elementor' ) }
					link={ elementorAppConfig.onboarding.urls.sitePlanner }
					target="_blank"
				/>
			</Grid>
			<FooterButtons skipButton={ { ...skipButton, target: '_self' } } className="e-onboarding__good-to-go-footer" />
		</Layout>
	);
}
