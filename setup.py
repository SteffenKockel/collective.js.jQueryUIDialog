from setuptools import setup, find_packages
import os

version = '1.0'

setup(name='collective.js.jqueryuidialog',
      version=version,
      description="A jQueryUI based dialog system for plone.",
      long_description=open("README.txt").read() + "\n" +
                       open(os.path.join("docs", "HISTORY.txt")).read(),
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        "Framework :: Plone",
        "Programming Language :: Python",
        ],
      keywords='',
      author='Steffen Kockel',
      author_email='s.kockel@groovecubes.de',
      url='https://github.com/SteffenKockel/collective.js.jQueryUIDialog.git',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['collective', 'collective.js'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          # -*- Extra requirements: -*-
          'collective.js.jqueryui',
          'minify',
      ],
      entry_points="""
      # -*- Entry points: -*-

      [z3c.autoinclude.plugin]
      target = plone
      """,
      setup_requires=["PasteScript"],
      paster_plugins=["ZopeSkel"],
#      cmdclass={ 
#	'minify_js':minify.command.minify_js,
#	'minify_css':minify.command.minify_css
#	},
      )
